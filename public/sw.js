// 仅缓存图标/图片请求（含跨域 favicon.ico），从而刷新或重复打开面板时不再重复走网络。
// Cache Storage 支持缓存 opaque response，不依赖目标站点的 CORS 头。

const ICON_CACHE_NAME = 'page-start-icon-cache-v1';
const FETCH_TIMEOUT_MS = 5000;

// 仅对“页面端确认 load 成功”的跨域 opaque 图标允许写入缓存，避免 404 也被 opaque 缓存污染。
const approvedOpaqueUrls = new Set();

function normalizeUrl(u) {
  try {
    return new URL(u).toString();
  } catch {
    return '';
  }
}

function shouldCacheResponse(resp) {
  if (!resp) return false;
  // 跨域常见为 opaque（无法读 status/header），允许缓存
  if (resp.type === 'opaque') return false;
  // 同源/可读响应：只缓存成功且确实是图片的响应，避免把 404 HTML 页面缓存成“图标”
  if (!resp.ok) return false;
  const ct = (resp.headers.get('content-type') || '').toLowerCase();
  return ct.startsWith('image/') || ct.includes('icon');
}

/** Cache Storage 仅支持 http/https；扩展内图片等会走 chrome-extension:，put 会抛错。 */
function isCacheableRequestUrl(urlString) {
  try {
    const p = new URL(urlString).protocol;
    return p === 'http:' || p === 'https:';
  } catch {
    return false;
  }
}

function shouldHandle(req) {
  if (req.method !== 'GET') return false;
  if (!isCacheableRequestUrl(req.url)) return false;
  const url = new URL(req.url);
  const isFavicon =
    url.pathname.endsWith('/favicon.ico') || url.pathname.toLowerCase().includes('favicon');
  const isImage = req.destination === 'image';
  return isImage || isFavicon;
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data && data.type === 'ICON_LOADED' && typeof data.url === 'string') {
    const u = normalizeUrl(data.url);
    if (u) approvedOpaqueUrls.add(u);
  }

  // JSONP 请求：在扩展页里绕过 extension_pages 的 script-src CSP 限制
  // 由 service worker 使用 fetch 拉取文本，再把 JSONP 包装剥离后 JSON.parse。
  if (data && data.type === 'JSONP_REQUEST' && typeof data.requestId === 'string') {
    const requestId = data.requestId;
    const url = typeof data.url === 'string' ? data.url : '';
    const params = data.params && typeof data.params === 'object' ? data.params : {};
    const callbackParam = typeof data.callbackParam === 'string' ? data.callbackParam : 'cb';
    const callbackName = typeof data.callbackName === 'string' ? data.callbackName : '';
    const timeoutMs = typeof data.timeoutMs === 'number' ? data.timeoutMs : 8000;

    const respond = (payload) => {
      try {
        event.source?.postMessage(payload);
      } catch {
        // ignore
      }
    };

    const job = (async () => {
      try {
        if (!url) throw new Error('JSONP_REQUEST: missing url');
        const searchParams = new URLSearchParams({ ...params, [callbackParam]: callbackName });
        const requestUrl = `${url}?${searchParams.toString()}`;

        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), timeoutMs);
        const resp = await fetch(requestUrl, { signal: controller.signal });
        clearTimeout(tid);

        // fetch 默认会按 charset 解码；但 Baidu 的联想 JSONP 有时会返回非 UTF-8/charset 不准。
        // 这里先按 utf-8 解码，若发现大量替换字符则回退到 gb18030。
        const buf = await resp.arrayBuffer();
        const decodeWith = (charset) => {
          try {
            return new TextDecoder(charset).decode(buf);
          } catch {
            return '';
          }
        };
        const textUtf8 = decodeWith('utf-8');
        const replCount = (textUtf8.match(/\ufffd/g) || []).length;
        const replRatio = replCount / Math.max(1, textUtf8.length);
        const text = replRatio > 0.005 ? decodeWith('gb18030') : textUtf8;
        if (!resp.ok) {
          // 也尽量返回响应文本，方便你在扩展控制台定位错误原因
          throw new Error(`JSONP_REQUEST: HTTP ${resp.status} ${text.slice(0, 200)}`);
        }

        // JSONP 返回形态通常是：callbackName({...});
        // 不能简单取全局第一个 '('，因为响应里可能存在其它括号/注释导致切片错误。
        const cbIndex = text.indexOf(callbackName);
        if (cbIndex < 0) throw new Error('JSONP_REQUEST: callback not found in body');
        const startParen = text.indexOf('(', cbIndex);
        if (startParen < 0) throw new Error('JSONP_REQUEST: invalid JSONP body');

        // 从 startParen 开始做括号深度匹配，避免 lastIndexOf(')') 切错。
        let depth = 0;
        let endParen = -1;
        for (let i = startParen; i < text.length; i++) {
          const ch = text[i];
          if (ch === '(') depth++;
          else if (ch === ')') {
            depth--;
            if (depth === 0) {
              endParen = i;
              break;
            }
          }
        }
        if (endParen < 0 || endParen <= startParen)
          throw new Error('JSONP_REQUEST: invalid JSONP body');

        const jsonText = text.slice(startParen + 1, endParen);
        // Baidu JSONP 返回体经常不是严格 JSON（例如 key 未加引号、字符串可能为单引号）。
        // 扩展环境 CSP 禁止 unsafe-eval，所以不能用 new Function。
        // 这里直接提取关键字段：s: [...]（只取建议列表即可）。
        function parseStringListFromArray(arrayBodyText) {
          const out = [];
          let i = 0;
          const len = arrayBodyText.length;

          const unescapeJs = (raw) => {
            // raw 已经是不带外层引号的内容
            let res = '';
            for (let k = 0; k < raw.length; k++) {
              const ch = raw[k];
              if (ch !== '\\') {
                res += ch;
                continue;
              }
              const next = raw[k + 1];
              if (!next) {
                res += ch;
                continue;
              }
              switch (next) {
                case 'n':
                  res += '\n';
                  k++;
                  break;
                case 'r':
                  res += '\r';
                  k++;
                  break;
                case 't':
                  res += '\t';
                  k++;
                  break;
                case 'b':
                  res += '\b';
                  k++;
                  break;
                case 'f':
                  res += '\f';
                  k++;
                  break;
                case 'u': {
                  const hex = raw.slice(k + 2, k + 6);
                  if (/^[0-9a-fA-F]{4}$/.test(hex)) {
                    res += String.fromCharCode(parseInt(hex, 16));
                    k += 5;
                  } else {
                    res += 'u';
                    k++;
                  }
                  break;
                }
                default:
                  // 支持 \', \" 或 \\ 这类简单转义
                  res += next;
                  k++;
                  break;
              }
            }
            return res;
          };

          while (i < len) {
            const ch = arrayBodyText[i];
            if (ch === '"' || ch === "'") {
              const quote = ch;
              i++; // skip quote
              let raw = '';
              while (i < len) {
                const c = arrayBodyText[i];
                if (c === '\\') {
                  // keep escape sequence in raw then unescape later
                  raw += c;
                  const n = arrayBodyText[i + 1];
                  if (n) {
                    raw += n;
                    i += 2;
                  } else {
                    i++;
                  }
                  continue;
                }
                if (c === quote) break;
                raw += c;
                i++;
              }
              // skip closing quote if present
              if (i < len && arrayBodyText[i] === quote) i++;
              out.push(unescapeJs(raw));
              continue;
            }
            i++;
          }

          return out;
        }

        function extractSArrayFromObjectLike(bodyText) {
          // 找到 s: [...]
          const sKeyRegex = /(?:^|[,{]\s*)['"]?s['"]?\s*:/m;
          const m = sKeyRegex.exec(bodyText);
          if (!m) return null;
          const colonIndex = m.index + m[0].length - 1; // roughly at :
          const firstBracket = bodyText.indexOf('[', colonIndex);
          if (firstBracket < 0) return null;

          let depth = 0;
          let endBracket = -1;
          for (let j = firstBracket; j < bodyText.length; j++) {
            const ch = bodyText[j];
            if (ch === '[') depth++;
            else if (ch === ']') {
              depth--;
              if (depth === 0) {
                endBracket = j;
                break;
              }
            }
          }
          if (endBracket < 0) return null;

          const arrayBody = bodyText.slice(firstBracket + 1, endBracket);
          const list = parseStringListFromArray(arrayBody);
          return list;
        }

        let parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch {
          const list = extractSArrayFromObjectLike(jsonText);
          if (Array.isArray(list)) parsed = { s: list };
          else throw new Error('JSONP_REQUEST: cannot parse suggestions');
        }

        respond({ type: 'JSONP_RESPONSE', requestId, ok: true, data: parsed });
      } catch (e) {
        respond({
          type: 'JSONP_RESPONSE',
          requestId,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    })();

    if (typeof event.waitUntil === 'function') event.waitUntil(job);
    else void job;
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (!shouldHandle(req)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(ICON_CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        const resp = await fetch(req, { signal: controller.signal });
        clearTimeout(tid);
        const reqUrl = normalizeUrl(req.url);
        const tryPut = async () => {
          try {
            if (shouldCacheResponse(resp)) {
              await cache.put(req, resp.clone());
            } else if (resp && resp.type === 'opaque' && reqUrl && approvedOpaqueUrls.has(reqUrl)) {
              await cache.put(req, resp.clone());
            }
          } catch {
            // 非 http(s) 或其它限制下 put 失败时忽略，避免扩展页报错
          }
        };
        void tryPut();
        return resp;
      } catch (e) {
        // 断网时尽量回退到缓存（即便上面没命中也不抛出）
        const fallback = await cache.match(req);
        if (fallback) return fallback;
        throw e;
      }
    })(),
  );
});

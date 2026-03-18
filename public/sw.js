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

function shouldHandle(req) {
  if (req.method !== 'GET') return false;
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
        if (shouldCacheResponse(resp)) {
          void cache.put(req, resp.clone());
        } else if (resp && resp.type === 'opaque' && reqUrl && approvedOpaqueUrls.has(reqUrl)) {
          void cache.put(req, resp.clone());
        }
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

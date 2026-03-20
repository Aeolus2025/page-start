import { genUniqueId } from '@/utils/id';

/**
 * 通用 JSONP 请求封装，用于跨域获取搜索引擎联想等接口。
 */
export function jsonp<T = unknown>(
  url: string,
  params: Record<string, string>,
  callbackParam: string,
  options?: { timeoutMs?: number },
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 8000;
  const callbackName = genUniqueId('__jsonp_');
  const chromeObj = (globalThis as unknown as { chrome?: { runtime?: { id?: unknown } } }).chrome;
  const isExtensionContext = !!chromeObj?.runtime?.id;

  // 扩展页：不要在页面注入外域 <script>（会触发 extension_pages 的 script-src 校验）
  // 改为把请求交给 service worker 用 fetch 拉取文本，再剥离 JSONP 包装。
  if (isExtensionContext) {
    return jsonpViaServiceWorker<T>(url, params, callbackParam, callbackName, timeoutMs);
  }

  // 普通 Web / `npm run dev`：保留 JSONP script 注入方式，保证现有行为。
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;

    const win = window as unknown as Record<string, unknown>;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const cleanup = () => {
      script.remove();
      delete win[callbackName];
      if (timeoutId) clearTimeout(timeoutId);
    };

    win[callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timeout'));
    }, timeoutMs);

    const searchParams = new URLSearchParams({ ...params, [callbackParam]: callbackName });
    script.src = `${url}?${searchParams.toString()}`;
    document.body.appendChild(script);
  });
}

async function jsonpViaServiceWorker<T>(
  url: string,
  params: Record<string, string>,
  callbackParam: string,
  callbackName: string,
  timeoutMs: number,
): Promise<T> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker not available');
  }

  const sw = navigator.serviceWorker;
  await sw.ready;
  const waitForController = (ms: number) =>
    new Promise<ServiceWorker>((resolve, reject) => {
      if (sw.controller) return resolve(sw.controller);
      const tid = setTimeout(() => {
        sw.removeEventListener('controllerchange', onChange);
        reject(new Error('Service worker controller not ready'));
      }, ms);
      const onChange = () => {
        if (sw.controller) {
          clearTimeout(tid);
          sw.removeEventListener('controllerchange', onChange);
          resolve(sw.controller);
        }
      };
      sw.addEventListener('controllerchange', onChange);
    });

  const controller = sw.controller ?? (await waitForController(Math.min(2000, timeoutMs)));
  if (!controller) throw new Error('Service worker controller not ready');

  const requestId = genUniqueId('__jsonp_req_');

  return await new Promise<T>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const cleanup = (handler: (e: MessageEvent) => void) => {
      if (timeoutId) clearTimeout(timeoutId);
      navigator.serviceWorker.removeEventListener('message', handler);
    };

    const handler = (e: MessageEvent) => {
      const data = (e.data || {}) as Record<string, unknown>;
      if (data.type !== 'JSONP_RESPONSE') return;
      if (data.requestId !== requestId) return;

      cleanup(handler);
      if (data.ok) resolve(data.data as T);
      else reject(new Error(typeof data.error === 'string' ? data.error : 'JSONP request failed'));
    };

    timeoutId = setTimeout(() => {
      cleanup(handler);
      reject(new Error('JSONP request timeout'));
    }, timeoutMs);

    navigator.serviceWorker.addEventListener('message', handler);
    controller.postMessage({
      type: 'JSONP_REQUEST',
      requestId,
      url,
      params,
      callbackParam,
      callbackName,
      timeoutMs,
    });
  });
}

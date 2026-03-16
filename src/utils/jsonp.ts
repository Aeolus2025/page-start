/**
 * 通用 JSONP 请求封装，用于跨域获取搜索引擎联想等接口。
 */
export function jsonp<T = unknown>(
  url: string,
  params: Record<string, string>,
  callbackParam: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = `__jsonp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const script = document.createElement('script');
    script.async = true;

    const cleanup = () => {
      script.remove();
      delete (window as Record<string, unknown>)[callbackName];
    };

    (window as Record<string, unknown>)[callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };

    const searchParams = new URLSearchParams({ ...params, [callbackParam]: callbackName });
    script.src = `${url}?${searchParams.toString()}`;
    document.body.appendChild(script);
  });
}

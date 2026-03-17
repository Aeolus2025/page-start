import { genUniqueId } from '@/utils/id';

/**
 * 通用 JSONP 请求封装，用于跨域获取搜索引擎联想等接口。
 */
export function jsonp<T = unknown>(
  url: string,
  params: Record<string, string>,
  callbackParam: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = genUniqueId('__jsonp_');
    const script = document.createElement('script');
    script.async = true;

    const win = window as unknown as Record<string, unknown>;
    const cleanup = () => {
      script.remove();
      delete win[callbackName];
    };

    win[callbackName] = (data: T) => {
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

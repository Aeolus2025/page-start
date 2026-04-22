import { parseHttpUrl, isBlockedLocalOrPrivateHost } from '@/utils/checkUrl';

/**
 * 根据任意 URL 推导站点 favicon（/favicon.ico）。
 * 仅支持 http/https，其他协议直接返回空字符串。
 */
export function getFaviconFromUrl(inputUrl: string): string {
  if (!inputUrl || typeof inputUrl !== 'string') return '';
  const u = parseHttpUrl(inputUrl.trim());
  if (!u) return '';
  const host = u.hostname;
  if (isBlockedLocalOrPrivateHost(host)) return '';
  const protocol = u.protocol || 'https:';
  return host ? `${protocol}//${host}/favicon.ico` : '';
}

/** 取名称首字母用于图标加载失败时的回退展示，空则返回空字符串 */
export function getFirstLetter(name: string): string {
  const s = (name || '').trim();
  return s ? s.charAt(0).toUpperCase() : '';
}

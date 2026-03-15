import type { SearchEngine, ValidateResult } from '@/types';

/**
 * 是否使用 iconfont 符号展示（有 icon 则用 <svg><use href="#icon-xxx">，由完整 iconfont.js 注入）
 */
export function isIconfontSymbol(icon: unknown): icon is string {
  return icon != null && typeof icon === 'string' && icon.trim().length > 0;
}

/**
 * 从搜索引擎的 URL 得到官网 favicon 地址（无 iconfont 或自定义引擎时用）
 */
export function getEngineIconUrl(engine: SearchEngine | null | undefined): string {
  if (!engine) return '';
  if (engine.iconUrl && typeof engine.iconUrl === 'string') return engine.iconUrl.trim();
  try {
    const u = new URL(engine.url || '');
    const host = u.hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
  } catch {
    return '';
  }
}

/** 快捷方式 favicon 来源：direct 直连站点（国内无需代理），google 需代理 */
export type FaviconProvider = 'direct' | 'google';

/**
 * 从任意链接 URL 得到站点 favicon 地址（快捷方式等用）。
 * 默认 direct：直连 https://域名/favicon.ico，国内无需代理；可选 google。
 */
export function getShortcutFaviconUrl(url: string, provider: FaviconProvider = 'direct'): string {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url.trim());
    const host = u.hostname;
    if (provider === 'google') {
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
    }
    return `https://${host}/favicon.ico`;
  } catch {
    return '';
  }
}

/**
 * 校验自定义搜索引擎 URL 格式。
 * 支持：① 完整 URL（含占位符 %s 或 {query}）；② 基础路径（不含占位符，保存时会自动追加 ?q=关键词）
 */
export function validateSearchEngineUrl(url: string): ValidateResult {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { valid: false, message: '请填写搜索 URL' };
  }
  try {
    const toParse = trimmed.replace(/%s|\{query\}/gi, 'x');
    const u = new URL(toParse);
    if (!/^https?:$/i.test(u.protocol)) {
      return { valid: false, message: '请使用 http 或 https 协议' };
    }
  } catch {
    return { valid: false, message: '请输入正确的 URL 格式' };
  }
  return { valid: true };
}

/**
 * 将用户输入的 URL 规范为带 %s 的搜索 URL。
 * 若已含 %s 或 {query} 则只做占位符统一；若为基础路径则追加 ?q=%s 或 &q=%s。
 */
export function normalizeSearchEngineUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  const hasPlaceholder = /%s|\{query\}/i.test(trimmed);
  if (hasPlaceholder) {
    return trimmed.replace(/\{query\}/gi, '%s');
  }
  try {
    const u = new URL(trimmed);
    const separator = u.search ? '&' : '?';
    return `${trimmed.replace(/\?$/, '')}${separator}q=%s`;
  } catch {
    return trimmed;
  }
}

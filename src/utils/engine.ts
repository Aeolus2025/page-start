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

/**
 * 校验自定义搜索引擎 URL 格式
 */
export function validateSearchEngineUrl(url: string): ValidateResult {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { valid: false, message: '请填写搜索 URL' };
  }
  const hasPlaceholder = /%s|\{query\}/i.test(trimmed);
  if (!hasPlaceholder) {
    return { valid: false, message: 'URL 中须包含关键词占位符 %s 或 {query}' };
  }
  try {
    const u = new URL(trimmed.replace(/%s|\{query\}/gi, 'x'));
    if (!/^https?:$/i.test(u.protocol)) {
      return { valid: false, message: '请使用 http 或 https 协议' };
    }
  } catch {
    return { valid: false, message: '请输入正确的 URL 格式' };
  }
  return { valid: true };
}

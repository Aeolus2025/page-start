import type { ValidateResult } from '@/types';

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

/** 判断是否为可当作图片 URL 使用的字符串（http/https/data） */
export function isIconUrl(icon: string): boolean {
  return Boolean(
    icon &&
      (icon.startsWith('http://') ||
        icon.startsWith('https://') ||
        icon.startsWith('data:'))
  );
}



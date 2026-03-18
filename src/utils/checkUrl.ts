import type { ValidateResult } from '@/types';

/**
 * 解析字符串为 URL，仅允许 http/https，否则返回 null。
 */
export function parseHttpUrl(input: string): URL | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u;
  } catch {
    return null;
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
  const toParse = trimmed.replace(/%s|\{query\}/gi, 'x');
  if (!parseHttpUrl(toParse)) {
    return { valid: false, message: '请输入正确的 URL 格式（请使用 http 或 https）' };
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

/**
 * 若 URL 无协议则补 https://，空串返回 ''。
 */
export function ensureAbsoluteUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * 校验快捷方式链接格式：必须是完整的 http/https URL（必须以 http:// 或 https:// 开头）。
 */
export function validateShortcutUrl(url: string): ValidateResult {
  const trimmed = (url || '').trim();
  if (!trimmed) return { valid: false, message: '请填写链接' };
  // 必须显式以 http(s):// 开头
  if (!/^https?:\/\//i.test(trimmed)) {
    return { valid: false, message: '请输入正确的链接（必须以 http:// 或 https:// 开头）' };
  }
  const u = parseHttpUrl(trimmed);
  if (!u) return { valid: false, message: '请输入正确的链接（URL 格式不合法）' };
  // hostname 不能为空；并避免形如 https://hh: 这种异常 host（部分环境可能被解析成空端口）
  if (!u.hostname) return { valid: false, message: '请输入正确的链接（缺少域名）' };
  if (u.host.endsWith(':')) return { valid: false, message: '请输入正确的链接（端口格式不正确）' };
  return { valid: true };
}

/** 判断是否为可当作图片 URL 使用的字符串（http/https/data） */
export function isIconUrl(icon: string): boolean {
  return Boolean(
    icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:')),
  );
}

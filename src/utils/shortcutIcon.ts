/**
 * 快捷方式图标展示相关工具
 */

/** 判断是否为可当作图片 URL 使用的字符串（http/https/data） */
export function isIconUrl(icon: string): boolean {
  return Boolean(
    icon &&
      (icon.startsWith('http://') ||
        icon.startsWith('https://') ||
        icon.startsWith('data:'))
  );
}

/** 取名称首字母用于图标加载失败时的回退展示，空则返回 '?' */
export function getFirstLetter(name: string): string {
  const s = (name || '').trim();
  return s ? s.charAt(0).toUpperCase() : '?';
}

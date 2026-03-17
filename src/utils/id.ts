/**
 * 生成带可选前缀的唯一 ID（时间戳 + 随机串）。
 * 使用下划线连接，保证可作为 JS 标识符使用（如 JSONP 回调名）。
 */
export function genUniqueId(prefix = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

import { StorageKey } from '@/types';

const prefix = 'page-start-';

/**
 * 从 localStorage 读取一项（键会加上项目前缀）
 */
export function getItem(key: StorageKey | string): string | null {
  try {
    return localStorage.getItem(prefix + key);
  } catch {
    return null;
  }
}

/**
 * 写入 localStorage（键会加上项目前缀；非字符串会 JSON 序列化）
 */
export function setItem(
  key: StorageKey | string,
  value: string | number | boolean | object
): void {
  try {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(prefix + key, v);
  } catch {
    // 配额或隐私模式可能抛错，静默忽略
  }
}

/**
 * 从 localStorage 删除一项（键会加上项目前缀）
 */
export function removeItem(key: StorageKey | string): void {
  try {
    localStorage.removeItem(prefix + key);
  } catch {
    // 静默忽略
  }
}

import { StorageKey } from '@/types';

const prefix = 'page-start-';

function prefixed(key: StorageKey | string): string {
  return prefix + key;
}

/**
 * 从 localStorage 读取一项（键会加上项目前缀）
 */
export function getItem(key: StorageKey | string): string | null {
  try {
    return localStorage.getItem(prefixed(key));
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
    localStorage.setItem(prefixed(key), v);
  } catch {
    // 配额或隐私模式可能抛错，静默忽略
  }
}

/**
 * 从 localStorage 读取 JSON 数组并用类型守卫过滤，解析失败或非数组返回 []。
 */
export function getJsonArray<T>(
  key: StorageKey | string,
  guard: (x: unknown) => x is T
): T[] {
  try {
    const raw = getItem(key);
    if (raw === null || raw === '') return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

/**
 * 从 localStorage 删除一项（键会加上项目前缀）
 */
export function removeItem(key: StorageKey | string): void {
  try {
    localStorage.removeItem(prefixed(key));
  } catch {
    // 静默忽略
  }
}

/**
 * 迁移：将历史版本使用的“无前缀 key”迁移为带前缀的 key。
 * 仅在新 key 缺失且旧 key 存在时迁移；迁移后会删除旧 key。
 *
 * 注：不处理 value 的结构变化，只做 key 级别迁移。
 */
export function migrateUnprefixedKeys(keys: readonly (StorageKey | string)[]): void {
  try {
    for (const key of keys) {
      const newKey = prefixed(key);
      const oldKey = String(key);
      if (localStorage.getItem(newKey) != null) continue;
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal == null) continue;
      localStorage.setItem(newKey, oldVal);
      localStorage.removeItem(oldKey);
    }
  } catch {
    // 静默忽略
  }
}

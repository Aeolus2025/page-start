const CACHE_NAME = 'page-start-icon-cache-v1';

/**
 * 删除已缓存的图标（用于“清除图标”后避免刷新立刻从缓存恢复）。
 * 实际缓存写入由 Service Worker 负责（可缓存 opaque response，不受 CORS 限制）。
 */
export async function deleteCachedIcon(url: string): Promise<void> {
  const key = (url || '').trim();
  if (!key) return;
  try {
    if (!('caches' in window)) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(key);
  } catch {
    // ignore
  }
}

export const ICON_CACHE_NAME = CACHE_NAME;

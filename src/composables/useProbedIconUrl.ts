import type { ComputedRef, Ref } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';

const LOAD_TIMEOUT_MS = 3000;

/**
 * 仅负责：设置 img.src + 监听 load/error + 超时兜底。
 * 真实的“跨域图标缓存”由 Service Worker + Cache Storage 完成（可缓存 opaque response，不依赖 CORS）。
 * 返回 iconUrl、showImg、iconError 及 img 的 @load/@error 处理函数。
 */
export function useProbedIconUrl(
  rawIconUrl: Ref<string> | ComputedRef<string>,
  options?: { onError?: () => void },
) {
  const iconUrl = ref('');
  const showImg = ref(false);
  const iconError = ref(false);
  let loadTimer: number | undefined;

  function clearLoadTimer() {
    if (loadTimer !== undefined) {
      clearTimeout(loadTimer);
      loadTimer = undefined;
    }
  }

  watch(
    rawIconUrl,
    (url) => {
      iconUrl.value = '';
      showImg.value = false;
      iconError.value = false;
      clearLoadTimer();
      if (!url) return;
      // 直接交给 <img> 去加载；SW 会负责命中本地缓存，避免重复联网
      iconUrl.value = url;
    },
    { immediate: true },
  );

  watch(iconUrl, (url) => {
    showImg.value = false;
    clearLoadTimer();
    if (!url) return;
    loadTimer = window.setTimeout(() => {
      showImg.value = false;
      iconError.value = true;
      loadTimer = undefined;
      options?.onError?.();
    }, LOAD_TIMEOUT_MS);
  });

  function handleImgLoad() {
    showImg.value = true;
    clearLoadTimer();
    // 通知 SW：该图标已确认加载成功，可安全缓存（用于跨域 opaque 响应的缓存判定）
    try {
      const url = iconUrl.value;
      if (url && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'ICON_LOADED', url });
      }
    } catch {
      // ignore
    }
  }

  function handleImgError() {
    showImg.value = false;
    iconError.value = true;
    clearLoadTimer();
    options?.onError?.();
  }

  onBeforeUnmount(clearLoadTimer);

  return {
    iconUrl,
    showImg,
    iconError,
    handleImgLoad,
    handleImgError,
  };
}

import type { ComputedRef, Ref } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';

const PROBE_TIMEOUT_MS = 4000;
const LOAD_TIMEOUT_MS = 3000;

/**
 * 先用 fetch 探测图标 URL（短超时），仅探测成功时再设置 img.src，避免长时间挂起请求与控制台 ERR_TIMED_OUT。
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

  async function probe(url: string) {
    iconUrl.value = '';
    if (!url) return;
    try {
      const controller = new AbortController();
      const id = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });
      clearTimeout(id);
      iconUrl.value = url;
    } catch {
      iconUrl.value = '';
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
      probe(url);
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

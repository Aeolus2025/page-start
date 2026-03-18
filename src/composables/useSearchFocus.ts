import { ref, onMounted, onUnmounted } from 'vue';

let blurTimeoutId: number | null = null;

export function useSearchFocus(onFocusChange: (focused: boolean) => void) {
  const isFocused = ref(false);

  function handleFocus() {
    if (blurTimeoutId) {
      clearTimeout(blurTimeoutId);
      blurTimeoutId = null;
    }
    isFocused.value = true;
    onFocusChange(true);
  }

  function handleBlur() {
    if (blurTimeoutId) clearTimeout(blurTimeoutId);
    blurTimeoutId = window.setTimeout(() => {
      blurTimeoutId = null;
      if (document.visibilityState === 'hidden') return;
      // Windows 点击任务栏会导致窗口失焦并触发 input blur，这种情况不应收起搜索栏
      if (!document.hasFocus()) return;
      isFocused.value = false;
      onFocusChange(false);
    }, 150);
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden' && blurTimeoutId) {
      clearTimeout(blurTimeoutId);
      blurTimeoutId = null;
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (blurTimeoutId) clearTimeout(blurTimeoutId);
  });

  return { isFocused, handleFocus, handleBlur };
}

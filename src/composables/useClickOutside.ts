import { watch, onUnmounted, type Ref } from 'vue';

/**
 * 点击元素外部时触发回调，常用于下拉、弹层关闭。
 * @param containerRef 容器元素 ref，点击其外部时触发
 * @param onOutside 回调
 * @param when 仅当为 true 时监听（如 visible）
 */
export function useClickOutside(
  containerRef: Ref<HTMLElement | null>,
  onOutside: () => void,
  when?: Ref<boolean>
) {
  let cleanup: (() => void) | null = null;

  function install() {
    if (cleanup) return;
    const onDocClick = (e: MouseEvent) => {
      const el = containerRef.value;
      if (el && !el.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', onDocClick);
    cleanup = () => {
      document.removeEventListener('mousedown', onDocClick);
      cleanup = null;
    };
  }

  if (when !== undefined) {
    watch(
      when,
      (v) => {
        if (cleanup) {
          cleanup();
          cleanup = null;
        }
        if (v) install();
      },
      { immediate: true }
    );
  } else {
    install();
  }

  onUnmounted(() => {
    if (cleanup) cleanup();
  });
}

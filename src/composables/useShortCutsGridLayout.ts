import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';

const CARD_WIDTH = 88;
const GAP = 20;
const DEFAULT_WIDTH = 520;

/**
 * 快捷面板网格布局：根据容器宽度计算每行列数，用于 CSS 变量 --grid-cols
 */
export function useShortCutsGridLayout(wrapRef: Ref<HTMLElement | null>) {
  const wrapWidth = ref(DEFAULT_WIDTH);

  const columnsPerRow = computed(() =>
    Math.max(1, Math.floor((wrapWidth.value + GAP) / (CARD_WIDTH + GAP)))
  );

  const gridWrapStyle = computed(() => ({
    '--grid-cols': String(columnsPerRow.value)
  }));

  let resizeObs: ResizeObserver | null = null;

  onMounted(() => {
    if (!wrapRef.value) return;
    wrapWidth.value = wrapRef.value.getBoundingClientRect().width || DEFAULT_WIDTH;
    resizeObs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w != null && w > 0) wrapWidth.value = w;
    });
    resizeObs.observe(wrapRef.value);
  });

  onUnmounted(() => {
    if (wrapRef.value && resizeObs) resizeObs.unobserve(wrapRef.value);
    resizeObs = null;
  });

  return { gridWrapStyle };
}


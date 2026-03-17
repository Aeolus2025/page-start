import { watch, nextTick, type Ref } from 'vue';

/**
 * 当 highlightIndex 变化时，将对应子元素滚动到可见区域。
 * 适用于下拉列表的键盘上下选择（history / suggest 等）。
 */
export function useScrollIntoViewOnHighlight(
  listRef: Ref<HTMLElement | null>,
  highlightIndex: Ref<number>,
  options?: {
    enabled?: Ref<boolean>;
    behavior?: ScrollBehavior;
  }
) {
  const behavior = options?.behavior ?? 'smooth';

  watch(
    [highlightIndex, options?.enabled ?? (() => true)],
    ([index, enabled]) => {
      if (!enabled) return;
      if (index < 0) return;
      nextTick(() => {
        const list = listRef.value;
        const child = list?.children[index] as HTMLElement | undefined;
        child?.scrollIntoView({ block: 'nearest', behavior });
      });
    }
  );
}


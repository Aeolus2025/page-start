import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { jsonp } from '@/utils/jsonp';
import { getSuggestConfig } from '@/utils/searchSuggest';
import type { SearchEngine } from '@/types';

const DEBOUNCE_MS = 250;

export function useSearchSuggest(
  query: Ref<string>,
  currentEngine: Ref<SearchEngine | null | undefined>,
  searchSuggestEnabled: Ref<boolean>
) {
  const suggestions = ref<string[]>([]);
  const loading = ref(false);
  const highlightIndex = ref(-1);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastRequestKeyword = '';

  function setHighlightIndex(value: number) {
    highlightIndex.value = value;
  }

  function incHighlight() {
    if (suggestions.value.length === 0) return;
    highlightIndex.value = Math.min(highlightIndex.value + 1, suggestions.value.length - 1);
  }

  function decHighlight() {
    highlightIndex.value = Math.max(highlightIndex.value - 1, -1);
  }

  function resetHighlight() {
    highlightIndex.value = -1;
  }

  watch(
    [query, currentEngine, searchSuggestEnabled],
    () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      const trimmed = query.value.trim();
      const engine = currentEngine.value;
      const enabled = searchSuggestEnabled.value;

      if (!trimmed || !enabled) {
        suggestions.value = [];
        loading.value = false;
        highlightIndex.value = -1;
        return;
      }

      const config = engine ? getSuggestConfig(engine.id) : null;
      if (!config) {
        suggestions.value = [];
        loading.value = false;
        highlightIndex.value = -1;
        return;
      }

      debounceTimer = setTimeout(async () => {
        debounceTimer = null;
        const keyword = query.value.trim();
        if (!keyword) {
          suggestions.value = [];
          loading.value = false;
          return;
        }
        lastRequestKeyword = keyword;
        loading.value = true;
        suggestions.value = [];
        highlightIndex.value = -1;

        const params: Record<string, string> = {
          [config.paramKeyForKeyword]: keyword,
          ...config.extraParams
        };

        try {
          const res = await jsonp<unknown>(config.url, params, config.callbackParam);
          if (lastRequestKeyword !== keyword) return;
          const list = config.parse(res);
          suggestions.value = Array.isArray(list) ? list : [];
        } catch {
          if (lastRequestKeyword !== keyword) return;
          suggestions.value = [];
        } finally {
          if (lastRequestKeyword === keyword) loading.value = false;
        }
      }, DEBOUNCE_MS);
    },
    { immediate: true }
  );

  return {
    suggestions,
    loading,
    highlightIndex,
    setHighlightIndex,
    incHighlight,
    decHighlight,
    resetHighlight
  };
}

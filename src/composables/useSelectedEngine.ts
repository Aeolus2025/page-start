import { ref, watch } from 'vue';
import { loadSavedEngine, saveSelectedEngine } from '@/constants/engines';
import type { SearchEngine } from '@/types';

export function useSelectedEngine() {
  const currentEngine = ref<SearchEngine>(loadSavedEngine());

  function saveEngine(eng: SearchEngine | null | undefined) {
    if (!eng) return;
    saveSelectedEngine(eng);
  }

  watch(currentEngine, (v) => {
    if (v) saveEngine(v);
  }, { deep: true });

  return { currentEngine, saveEngine };
}

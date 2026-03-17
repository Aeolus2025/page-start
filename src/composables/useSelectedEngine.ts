import { computed } from 'vue';
import { useSearchEnginesStore } from '@/store/search';
import type { SearchEngine } from '@/types';

export function useSelectedEngine() {
  const store = useSearchEnginesStore();
  const currentEngine = computed<SearchEngine>({
    get: () => store.selectedEngine,
    set: (eng) => { if (eng) store.setSelectedEngine(eng); }
  });
  const saveEngine = (eng: SearchEngine | null | undefined) => { if (eng) store.setSelectedEngine(eng); };
  return { currentEngine, saveEngine };
}

import { ref, computed } from 'vue';
import { getItem, setItem } from '@/utils/storage';
import { useConfigStore } from '@/store/config';

const HISTORY_KEY = 'searchHistory';
const MAX_ITEMS = 20;

function loadHistory(): string[] {
  try {
    const raw = getItem(HISTORY_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw as string);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveHistory(list: string[]) {
  setItem(HISTORY_KEY, list);
}

export function useSearchHistory() {
  const config = useConfigStore();
  const list = ref<string[]>(loadHistory());

  const history = computed(() => list.value);

  /**
   * 添加搜索记录。
   * @param persistOnly 为 true 时只写入存储，不更新当前会话的列表（用于点击搜索即将跳转时，避免下拉里立刻出现新项）
   */
  function addHistory(keyword: string, options?: { persistOnly?: boolean }) {
    if (!config.searchHistoryEnabled) return;
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const current = options?.persistOnly ? loadHistory() : list.value;
    const next = [trimmed, ...current.filter((x) => x !== trimmed)].slice(0, MAX_ITEMS);
    saveHistory(next);
    if (!options?.persistOnly) list.value = next;
  }

  function clearHistory() {
    list.value = [];
    saveHistory([]);
  }

  return { history, addHistory, clearHistory };
}

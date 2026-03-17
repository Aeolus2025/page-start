import { type Ref } from 'vue';
import { useConfigStore } from '@/store/config';
import type { SearchEngine } from '@/types';

/**
 * 搜索跳转：根据当前引擎构建 URL 并跳转（当前页或新标签）
 */
export function useSearchNavigate(currentEngine: Ref<SearchEngine | null | undefined>) {
  const config = useConfigStore();

  function buildSearchUrl(keyword: string): string {
    const url = currentEngine.value?.url || '';
    return url ? url.replace('%s', encodeURIComponent(keyword.trim())) : '';
  }

  function navigateToSearchUrl(url: string) {
    if (!url) return;
    if (config.openSearchInNewTabEnabled) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }

  return { buildSearchUrl, navigateToSearchUrl };
}

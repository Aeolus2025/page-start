import type { SearchEngine } from '@/types';

/** 内置搜索引擎列表，单一数据源；带 icon 的引擎使用 iconfont 注入的 symbol（<use href="#icon-xxx">） */
export const DEFAULT_ENGINES: SearchEngine[] = [
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=%s', icon: 'icon-baidu' },
  { id: 'google', name: '谷歌', url: 'https://www.google.com/search?q=%s', icon: 'icon-google-circle-fill' },
  { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q=%s', icon: 'icon-biying' }
];

const STORAGE_KEY = 'page-start-selected-engine';

export function loadSavedEngine(): SearchEngine {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ENGINES[0];
    const o = JSON.parse(raw) as { id?: string; name?: string; url?: string };
    const found =
      DEFAULT_ENGINES.find((e) => e.id === o?.id) || DEFAULT_ENGINES.find((e) => e.name === o?.name);
    if (found) return found;
    if (o?.name && o?.url) return { id: 'custom', name: o.name, url: o.url };
    return DEFAULT_ENGINES[0];
  } catch {
    return DEFAULT_ENGINES[0];
  }
}

export function saveSelectedEngine(engine: SearchEngine | null | undefined): void {
  try {
    if (!engine) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: engine.id, name: engine.name, url: engine.url })
    );
  } catch (_) {}
}

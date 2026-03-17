import type { SearchEngine } from '@/types';

/** 内置搜索引擎列表，单一数据源；带 icon 的引擎使用 iconfont 注入的 symbol（<use href="#icon-xxx">） */
export const DEFAULT_ENGINES: SearchEngine[] = [
  { id: 'baidu', name: 'Baidu', url: 'https://www.baidu.com/s?wd=%s', icon: 'icon-baidu' },
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s', icon: 'icon-google-circle-fill' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s', icon: 'icon-biying' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=%s', icon: 'icon-GitHub' },
  { id: 'bilibili', name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword=%s', icon: 'icon-bilibili-line' },
  { id: 'sogou', name: 'Sogou', url: 'https://www.sogou.com/web?query=%s', icon: 'icon-sougou' },
  { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text=%s', icon: 'icon-yandex' },
  { id: 'so360', name: '360', url: 'https://www.so.com/s?q=%s', icon: 'icon-weibiaoti-3' },
  { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p=%s', icon: 'icon-yahoo-fill' }
];

/**
 * 全局配置 Store：外观、时钟、搜索、导入导出等。
 * 状态持久化到 localStorage（前缀 page-start-）。
 */
import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage';
import type { ConfigState, ExportPayload } from '@/types';

const defaultBg = '/background.jpg';

/** 配置默认值，用于初始化和恢复默认 */
export const DEFAULT_CONFIG: ConfigState = {
  backgroundImage: '',
  timeFormat24: true,
  timeShowSeconds: false,
  timeFontSize: 'medium',
  timeFontWeight: 'normal',
  timeFontStyle: 'normal',
  focusSearchOnLoad: true,
  searchHistoryEnabled: true,
  openSearchInNewTab: false,
  exportIncludeBackground: true
};

function readBool(key: string, defaultValue: boolean): boolean {
  const v = getItem(key);
  if (v === null) return defaultValue;
  return v === 'true';
}

function readStr(key: string, defaultValue: string): string {
  const v = getItem(key);
  return v !== null && v !== '' ? v : defaultValue;
}

/** 从 localStorage 原始字符串解析隐藏引擎 ID 列表 */
function parseHiddenEngineIds(raw: string | null): string[] {
  try {
    const a = raw == null ? [] : JSON.parse(raw as string);
    return Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** 从 localStorage 原始字符串解析自定义引擎列表 */
function parseCustomEngines(raw: string | null): { name: string; url: string }[] {
  try {
    const a = raw == null ? [] : JSON.parse(raw as string);
    return Array.isArray(a)
      ? a.filter((x) => x && typeof x.name === 'string' && typeof x.url === 'string')
      : [];
  } catch {
    return [];
  }
}

/** 将导入的 config 对象应用到 store 并持久化 */
function applyImportedConfig(
  store: Record<string, unknown>,
  config: Record<string, unknown> | undefined
): void {
  if (!config || typeof config !== 'object') return;
  if (typeof config.backgroundImage === 'string') {
    store.backgroundImage = config.backgroundImage;
    setItem('backgroundImage', config.backgroundImage);
  }
  if (typeof config.timeFormat24 === 'boolean') {
    store.timeFormat24 = config.timeFormat24;
    setItem('timeFormat24', config.timeFormat24);
  }
  if (typeof config.timeShowSeconds === 'boolean') {
    store.timeShowSeconds = config.timeShowSeconds;
    setItem('timeShowSeconds', config.timeShowSeconds);
  }
  if (['small', 'medium', 'large'].includes(config.timeFontSize as string)) {
    const val = config.timeFontSize as ConfigState['timeFontSize'];
    store.timeFontSize = val;
    setItem('timeFontSize', val);
  }
  if (config.timeFontWeight === 'bold' || config.timeFontWeight === 'normal') {
    store.timeFontWeight = config.timeFontWeight;
    setItem('timeFontWeight', config.timeFontWeight as string);
  }
  if (['normal', 'italic', 'script'].includes(config.timeFontStyle as string)) {
    store.timeFontStyle = config.timeFontStyle as ConfigState['timeFontStyle'];
    setItem('timeFontStyle', store.timeFontStyle as string);
  }
  if (typeof config.focusSearchOnLoad === 'boolean') {
    store.focusSearchOnLoad = config.focusSearchOnLoad;
    setItem('focusSearchOnLoad', config.focusSearchOnLoad);
  }
  if (typeof config.searchHistoryEnabled === 'boolean') {
    store.searchHistoryEnabled = config.searchHistoryEnabled;
    setItem('searchHistoryEnabled', config.searchHistoryEnabled);
  }
  if (typeof config.openSearchInNewTab === 'boolean') {
    store.openSearchInNewTab = config.openSearchInNewTab;
    setItem('openSearchInNewTab', config.openSearchInNewTab);
  }
  if (typeof config.exportIncludeBackground === 'boolean') {
    store.exportIncludeBackground = config.exportIncludeBackground;
    setItem('exportIncludeBackground', config.exportIncludeBackground);
  }
}

/** 持久化导入的引擎相关数据（隐藏列表、自定义引擎） */
function persistImportedEngineData(
  hidden: unknown,
  custom: unknown
): void {
  if (Array.isArray(hidden)) {
    const ids = hidden.filter((x): x is string => typeof x === 'string');
    setItem('hiddenEngineIds', JSON.stringify(ids));
  }
  if (Array.isArray(custom)) {
    const list = custom.filter(
      (x) => x && typeof x.name === 'string' && typeof x.url === 'string'
    );
    setItem('custom-engines', JSON.stringify(list));
  }
}

export const useConfigStore = defineStore('config', {
  state(): ConfigState {
    return {
      backgroundImage: readStr('backgroundImage', DEFAULT_CONFIG.backgroundImage),
      timeFormat24: readBool('timeFormat24', DEFAULT_CONFIG.timeFormat24),
      timeShowSeconds: readBool('timeShowSeconds', DEFAULT_CONFIG.timeShowSeconds),
      timeFontSize: (readStr('timeFontSize', DEFAULT_CONFIG.timeFontSize) as ConfigState['timeFontSize']) || DEFAULT_CONFIG.timeFontSize,
      timeFontWeight: readStr('timeFontWeight', DEFAULT_CONFIG.timeFontWeight) === 'bold' ? 'bold' : 'normal',
      timeFontStyle: (readStr('timeFontStyle', DEFAULT_CONFIG.timeFontStyle) as ConfigState['timeFontStyle']) || DEFAULT_CONFIG.timeFontStyle,
      focusSearchOnLoad: readBool('focusSearchOnLoad', DEFAULT_CONFIG.focusSearchOnLoad),
      searchHistoryEnabled: readBool('searchHistoryEnabled', DEFAULT_CONFIG.searchHistoryEnabled),
      openSearchInNewTab: readBool('openSearchInNewTab', DEFAULT_CONFIG.openSearchInNewTab),
      exportIncludeBackground: readBool('exportIncludeBackground', DEFAULT_CONFIG.exportIncludeBackground)
    };
  },
  getters: {
    backgroundUrl(state): string {
      return state.backgroundImage?.trim() !== ''
        ? state.backgroundImage.trim()
        : defaultBg;
    },
    hasCustomBackground(state): boolean {
      return Boolean(state.backgroundImage?.trim());
    }
  },
  actions: {
    setBackgroundImage(url: string) {
      this.backgroundImage = url || '';
      setItem('backgroundImage', this.backgroundImage);
    },
    removeBackgroundImage() {
      this.backgroundImage = '';
      setItem('backgroundImage', '');
    },
    setTimeFormat24(value: boolean) {
      this.timeFormat24 = Boolean(value);
      setItem('timeFormat24', this.timeFormat24);
    },
    setTimeShowSeconds(value: boolean) {
      this.timeShowSeconds = Boolean(value);
      setItem('timeShowSeconds', this.timeShowSeconds);
    },
    setTimeFontSize(value: string) {
      const v = ['small', 'medium', 'large'].includes(value) ? value : 'medium';
      this.timeFontSize = v as ConfigState['timeFontSize'];
      setItem('timeFontSize', this.timeFontSize);
    },
    setTimeFontWeight(value: string) {
      this.timeFontWeight = value === 'bold' ? 'bold' : 'normal';
      setItem('timeFontWeight', this.timeFontWeight);
    },
    setTimeFontStyle(value: string) {
      const v = ['normal', 'italic', 'script'].includes(value) ? value : 'normal';
      this.timeFontStyle = v as ConfigState['timeFontStyle'];
      setItem('timeFontStyle', this.timeFontStyle);
    },
    setFocusSearchOnLoad(value: boolean) {
      this.focusSearchOnLoad = Boolean(value);
      setItem('focusSearchOnLoad', this.focusSearchOnLoad);
    },
    setSearchHistoryEnabled(value: boolean) {
      this.searchHistoryEnabled = Boolean(value);
      setItem('searchHistoryEnabled', this.searchHistoryEnabled);
    },
    setOpenSearchInNewTab(value: boolean) {
      this.openSearchInNewTab = Boolean(value);
      setItem('openSearchInNewTab', this.openSearchInNewTab);
    },
    setExportIncludeBackground(value: boolean) {
      this.exportIncludeBackground = Boolean(value);
      setItem('exportIncludeBackground', this.exportIncludeBackground);
    },
    /** 恢复所有配置为默认值并持久化 */
    resetToDefaults() {
      this.backgroundImage = DEFAULT_CONFIG.backgroundImage;
      this.timeFormat24 = DEFAULT_CONFIG.timeFormat24;
      this.timeShowSeconds = DEFAULT_CONFIG.timeShowSeconds;
      this.timeFontSize = DEFAULT_CONFIG.timeFontSize;
      this.timeFontWeight = DEFAULT_CONFIG.timeFontWeight;
      this.timeFontStyle = DEFAULT_CONFIG.timeFontStyle;
      this.focusSearchOnLoad = DEFAULT_CONFIG.focusSearchOnLoad;
      this.searchHistoryEnabled = DEFAULT_CONFIG.searchHistoryEnabled;
      this.openSearchInNewTab = DEFAULT_CONFIG.openSearchInNewTab;
      this.exportIncludeBackground = DEFAULT_CONFIG.exportIncludeBackground;
      setItem('backgroundImage', this.backgroundImage);
      setItem('timeFormat24', this.timeFormat24);
      setItem('timeShowSeconds', this.timeShowSeconds);
      setItem('timeFontSize', this.timeFontSize);
      setItem('timeFontWeight', this.timeFontWeight);
      setItem('timeFontStyle', this.timeFontStyle);
      setItem('focusSearchOnLoad', this.focusSearchOnLoad);
      setItem('searchHistoryEnabled', this.searchHistoryEnabled);
      setItem('openSearchInNewTab', this.openSearchInNewTab);
      setItem('exportIncludeBackground', this.exportIncludeBackground);
      setItem('hiddenEngineIds', '[]');
    },
    /** 导出配置为 JSON 对象（含 config、hiddenEngineIds、customEngines） */
    exportConfig(): ExportPayload {
      const configSnapshot = { ...this.$state };
      if (!this.exportIncludeBackground) configSnapshot.backgroundImage = '';
      return {
        version: 1,
        config: configSnapshot,
        hiddenEngineIds: parseHiddenEngineIds(getItem('hiddenEngineIds')),
        customEngines: parseCustomEngines(getItem('custom-engines'))
      };
    },
    /** 导入配置；返回 true 表示成功，建议调用后刷新页面以使引擎等生效 */
    importConfig(data: unknown): boolean {
      if (!data || typeof data !== 'object') return false;
      const d = data as Record<string, unknown>;
      if (d.version !== 1) return false;
      applyImportedConfig(
        this as unknown as Record<string, unknown>,
        d.config as Record<string, unknown> | undefined
      );
      persistImportedEngineData(d.hiddenEngineIds, d.customEngines);
      return true;
    }
  }
});

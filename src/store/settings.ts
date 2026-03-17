/**
 * 全局配置 Store：外观、时钟、搜索开关、导入导出入口等。
 * 状态持久化到 localStorage（前缀 page-start-）。
 * 搜索引擎/快捷方式数据由 searchEngines、shortcuts 两个 store 负责。
 */
import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage';
import type { ConfigState, ExportPayload, ThemeMode } from '@/types';
import { StorageKey } from '@/types';
import { useSearchEnginesStore } from './search';
import { useShortcutsStore } from './shortcuts';
import { isShortcutItem } from '@/types/guards';

const THEME_VALUES: ThemeMode[] = ['light', 'dark', 'system'];
function readTheme(key: StorageKey, defaultValue: ThemeMode): ThemeMode {
  const v = getItem(key);
  if (v === null || v === '') return defaultValue;
  return THEME_VALUES.includes(v as ThemeMode) ? (v as ThemeMode) : defaultValue;
}

const defaultBg = '/image.jpg';

/** 配置默认值，用于初始化和恢复默认 */
export const DEFAULT_CONFIG: ConfigState = {
  theme: 'system',
  backgroundImage: '',
  timeFormat24Enabled: true,
  timeShowSecondsEnabled: false,
  timeFontSize: 'medium',
  timeFontWeight: 'normal',
  timeFontStyle: 'normal',
  focusSearchOnLoadEnabled: true,
  searchHistoryEnabled: true,
  searchSuggestEnabled: true,
  openSearchInNewTabEnabled: false,
  exportBackgroundEnabled: true,
  exportSearchEnginesEnabled: true,
  exportShortCutsEnabled: true,
};

function readBool(key: StorageKey, defaultValue: boolean): boolean {
  const v = getItem(key);
  if (v === null) return defaultValue;
  return v === 'true';
}

function readStr(key: StorageKey, defaultValue: string): string {
  const v = getItem(key);
  return v !== null && v !== '' ? v : defaultValue;
}

/** 将导入的 config 对象应用到 store 并持久化 */
function applyImportedConfig(
  store: Record<string, unknown>,
  config: Record<string, unknown> | undefined,
): void {
  if (!config || typeof config !== 'object') return;
  if (THEME_VALUES.includes(config.theme as ThemeMode)) {
    store.theme = config.theme as ThemeMode;
    setItem(StorageKey.Theme, store.theme as string);
  }
  if (typeof config.backgroundImage === 'string') {
    store.backgroundImage = config.backgroundImage;
    setItem(StorageKey.BackgroundImage, config.backgroundImage);
  }
  if (typeof config.timeFormat24Enabled === 'boolean') {
    store.timeFormat24Enabled = config.timeFormat24Enabled;
    setItem(StorageKey.TimeFormat24Enabled, config.timeFormat24Enabled);
  }
  if (typeof config.timeShowSecondsEnabled === 'boolean') {
    store.timeShowSecondsEnabled = config.timeShowSecondsEnabled;
    setItem(StorageKey.TimeShowSecondsEnabled, config.timeShowSecondsEnabled);
  }
  if (['small', 'medium', 'large'].includes(config.timeFontSize as string)) {
    const val = config.timeFontSize as ConfigState['timeFontSize'];
    store.timeFontSize = val;
    setItem(StorageKey.TimeFontSize, val);
  }
  if (config.timeFontWeight === 'bold' || config.timeFontWeight === 'normal') {
    store.timeFontWeight = config.timeFontWeight;
    setItem(StorageKey.TimeFontWeight, config.timeFontWeight as string);
  }
  if (['normal', 'italic', 'script'].includes(config.timeFontStyle as string)) {
    store.timeFontStyle = config.timeFontStyle as ConfigState['timeFontStyle'];
    setItem(StorageKey.TimeFontStyle, store.timeFontStyle as string);
  }
  if (typeof config.focusSearchOnLoadEnabled === 'boolean') {
    store.focusSearchOnLoadEnabled = config.focusSearchOnLoadEnabled;
    setItem(StorageKey.FocusSearchOnLoadEnabled, config.focusSearchOnLoadEnabled);
  }
  if (typeof config.searchHistoryEnabled === 'boolean') {
    store.searchHistoryEnabled = config.searchHistoryEnabled;
    setItem(StorageKey.SearchHistoryEnabled, config.searchHistoryEnabled);
  }
  if (typeof config.searchSuggestEnabled === 'boolean') {
    store.searchSuggestEnabled = config.searchSuggestEnabled;
    setItem(StorageKey.SearchSuggestEnabled, config.searchSuggestEnabled);
  }
  if (typeof config.openSearchInNewTabEnabled === 'boolean') {
    store.openSearchInNewTabEnabled = config.openSearchInNewTabEnabled;
    setItem(StorageKey.OpenSearchInNewTabEnabled, config.openSearchInNewTabEnabled);
  }
  if (typeof config.exportBackgroundEnabled === 'boolean') {
    store.exportBackgroundEnabled = config.exportBackgroundEnabled;
    setItem(StorageKey.ExportBackgroundEnabled, config.exportBackgroundEnabled);
  }
  if (typeof config.exportSearchEnginesEnabled === 'boolean') {
    store.exportSearchEnginesEnabled = config.exportSearchEnginesEnabled;
    setItem(StorageKey.ExportSearchEnginesEnabled, config.exportSearchEnginesEnabled);
  }
  if (typeof config.exportShortCutsEnabled === 'boolean') {
    store.exportShortCutsEnabled = config.exportShortCutsEnabled;
    setItem(StorageKey.ExportShortCutsEnabled, config.exportShortCutsEnabled);
  }
}

export const useConfigStore = defineStore('config', {
  state(): ConfigState {
    return {
      theme: readTheme(StorageKey.Theme, DEFAULT_CONFIG.theme),
      backgroundImage: readStr(StorageKey.BackgroundImage, DEFAULT_CONFIG.backgroundImage),
      timeFormat24Enabled: readBool(
        StorageKey.TimeFormat24Enabled,
        DEFAULT_CONFIG.timeFormat24Enabled,
      ),
      timeShowSecondsEnabled: readBool(
        StorageKey.TimeShowSecondsEnabled,
        DEFAULT_CONFIG.timeShowSecondsEnabled,
      ),
      timeFontSize:
        (readStr(
          StorageKey.TimeFontSize,
          DEFAULT_CONFIG.timeFontSize,
        ) as ConfigState['timeFontSize']) || DEFAULT_CONFIG.timeFontSize,
      timeFontWeight:
        readStr(StorageKey.TimeFontWeight, DEFAULT_CONFIG.timeFontWeight) === 'bold'
          ? 'bold'
          : 'normal',
      timeFontStyle:
        (readStr(
          StorageKey.TimeFontStyle,
          DEFAULT_CONFIG.timeFontStyle,
        ) as ConfigState['timeFontStyle']) || DEFAULT_CONFIG.timeFontStyle,
      focusSearchOnLoadEnabled: readBool(
        StorageKey.FocusSearchOnLoadEnabled,
        DEFAULT_CONFIG.focusSearchOnLoadEnabled,
      ),
      searchHistoryEnabled: readBool(
        StorageKey.SearchHistoryEnabled,
        DEFAULT_CONFIG.searchHistoryEnabled,
      ),
      searchSuggestEnabled: readBool(
        StorageKey.SearchSuggestEnabled,
        DEFAULT_CONFIG.searchSuggestEnabled,
      ),
      openSearchInNewTabEnabled: readBool(
        StorageKey.OpenSearchInNewTabEnabled,
        DEFAULT_CONFIG.openSearchInNewTabEnabled,
      ),
      exportBackgroundEnabled: readBool(
        StorageKey.ExportBackgroundEnabled,
        DEFAULT_CONFIG.exportBackgroundEnabled,
      ),
      exportSearchEnginesEnabled: readBool(
        StorageKey.ExportSearchEnginesEnabled,
        DEFAULT_CONFIG.exportSearchEnginesEnabled,
      ),
      exportShortCutsEnabled: readBool(
        StorageKey.ExportShortCutsEnabled,
        DEFAULT_CONFIG.exportShortCutsEnabled,
      ),
    };
  },
  getters: {
    backgroundUrl(state): string {
      return state.backgroundImage?.trim() !== '' ? state.backgroundImage.trim() : defaultBg;
    },
    hasCustomBackground(state): boolean {
      return Boolean(state.backgroundImage?.trim());
    },
  },
  actions: {
    setTheme(value: ThemeMode) {
      if (!THEME_VALUES.includes(value)) return;
      this.theme = value;
      setItem(StorageKey.Theme, this.theme);
    },
    setBackgroundImage(url: string) {
      this.backgroundImage = url || '';
      setItem(StorageKey.BackgroundImage, this.backgroundImage);
    },
    removeBackgroundImage() {
      this.backgroundImage = '';
      setItem(StorageKey.BackgroundImage, '');
    },
    setTimeFormat24Enabled(value: boolean) {
      this.timeFormat24Enabled = Boolean(value);
      setItem(StorageKey.TimeFormat24Enabled, this.timeFormat24Enabled);
    },
    setTimeShowSecondsEnabled(value: boolean) {
      this.timeShowSecondsEnabled = Boolean(value);
      setItem(StorageKey.TimeShowSecondsEnabled, this.timeShowSecondsEnabled);
    },
    setTimeFontSize(value: string) {
      const v = ['small', 'medium', 'large'].includes(value) ? value : 'medium';
      this.timeFontSize = v as ConfigState['timeFontSize'];
      setItem(StorageKey.TimeFontSize, this.timeFontSize);
    },
    setTimeFontWeight(value: string) {
      this.timeFontWeight = value === 'bold' ? 'bold' : 'normal';
      setItem(StorageKey.TimeFontWeight, this.timeFontWeight);
    },
    setTimeFontStyle(value: string) {
      const v = ['normal', 'italic', 'script'].includes(value) ? value : 'normal';
      this.timeFontStyle = v as ConfigState['timeFontStyle'];
      setItem(StorageKey.TimeFontStyle, this.timeFontStyle);
    },
    setFocusSearchOnLoadEnabled(value: boolean) {
      this.focusSearchOnLoadEnabled = Boolean(value);
      setItem(StorageKey.FocusSearchOnLoadEnabled, this.focusSearchOnLoadEnabled);
    },
    setSearchHistoryEnabled(value: boolean) {
      this.searchHistoryEnabled = Boolean(value);
      setItem(StorageKey.SearchHistoryEnabled, this.searchHistoryEnabled);
    },
    setSearchSuggestEnabled(value: boolean) {
      this.searchSuggestEnabled = Boolean(value);
      setItem(StorageKey.SearchSuggestEnabled, this.searchSuggestEnabled);
    },
    setOpenSearchInNewTabEnabled(value: boolean) {
      this.openSearchInNewTabEnabled = Boolean(value);
      setItem(StorageKey.OpenSearchInNewTabEnabled, this.openSearchInNewTabEnabled);
    },
    setExportBackgroundEnabled(value: boolean) {
      this.exportBackgroundEnabled = Boolean(value);
      setItem(StorageKey.ExportBackgroundEnabled, this.exportBackgroundEnabled);
    },
    setExportSearchEnginesEnabled(value: boolean) {
      this.exportSearchEnginesEnabled = Boolean(value);
      setItem(StorageKey.ExportSearchEnginesEnabled, this.exportSearchEnginesEnabled);
    },
    setExportShortCutsEnabled(value: boolean) {
      this.exportShortCutsEnabled = Boolean(value);
      setItem(StorageKey.ExportShortCutsEnabled, this.exportShortCutsEnabled);
    },
    /** 恢复所有配置为默认值并持久化 */
    resetToDefaults() {
      this.theme = DEFAULT_CONFIG.theme;
      this.backgroundImage = DEFAULT_CONFIG.backgroundImage;
      this.timeFormat24Enabled = DEFAULT_CONFIG.timeFormat24Enabled;
      this.timeShowSecondsEnabled = DEFAULT_CONFIG.timeShowSecondsEnabled;
      this.timeFontSize = DEFAULT_CONFIG.timeFontSize;
      this.timeFontWeight = DEFAULT_CONFIG.timeFontWeight;
      this.timeFontStyle = DEFAULT_CONFIG.timeFontStyle;
      this.focusSearchOnLoadEnabled = DEFAULT_CONFIG.focusSearchOnLoadEnabled;
      this.searchHistoryEnabled = DEFAULT_CONFIG.searchHistoryEnabled;
      this.searchSuggestEnabled = DEFAULT_CONFIG.searchSuggestEnabled;
      this.openSearchInNewTabEnabled = DEFAULT_CONFIG.openSearchInNewTabEnabled;
      this.exportBackgroundEnabled = DEFAULT_CONFIG.exportBackgroundEnabled;
      this.exportSearchEnginesEnabled = DEFAULT_CONFIG.exportSearchEnginesEnabled;
      this.exportShortCutsEnabled = DEFAULT_CONFIG.exportShortCutsEnabled;
      setItem(StorageKey.Theme, this.theme);
      setItem(StorageKey.BackgroundImage, this.backgroundImage);
      setItem(StorageKey.TimeFormat24Enabled, this.timeFormat24Enabled);
      setItem(StorageKey.TimeShowSecondsEnabled, this.timeShowSecondsEnabled);
      setItem(StorageKey.TimeFontSize, this.timeFontSize);
      setItem(StorageKey.TimeFontWeight, this.timeFontWeight);
      setItem(StorageKey.TimeFontStyle, this.timeFontStyle);
      setItem(StorageKey.FocusSearchOnLoadEnabled, this.focusSearchOnLoadEnabled);
      setItem(StorageKey.SearchHistoryEnabled, this.searchHistoryEnabled);
      setItem(StorageKey.SearchSuggestEnabled, this.searchSuggestEnabled);
      setItem(StorageKey.OpenSearchInNewTabEnabled, this.openSearchInNewTabEnabled);
      setItem(StorageKey.ExportBackgroundEnabled, this.exportBackgroundEnabled);
      setItem(StorageKey.ExportSearchEnginesEnabled, this.exportSearchEnginesEnabled);
      setItem(StorageKey.ExportShortCutsEnabled, this.exportShortCutsEnabled);
      useSearchEnginesStore().clearHiddenIds();
    },
    /** 导出配置为 JSON 对象（含 config、搜索引擎、快捷方式由各自 store 提供） */
    exportConfig(): ExportPayload {
      const configSnapshot = { ...this.$state };
      if (!this.exportBackgroundEnabled) configSnapshot.backgroundImage = '';
      const payload: ExportPayload = {
        version: 1,
        config: configSnapshot,
        hiddenEngineIds: [],
        customEngines: [],
      };
      if (this.exportSearchEnginesEnabled) {
        const engineData = useSearchEnginesStore().getExportData();
        payload.hiddenEngineIds = engineData.hiddenEngineIds;
        payload.customEngines = engineData.customEngines;
        payload.currentEngine = engineData.currentEngine;
      }
      if (this.exportShortCutsEnabled) {
        payload.shortcuts = [...useShortcutsStore().items];
      }
      return payload;
    },
    /** 导入配置；返回 true 表示成功，建议调用后刷新页面以使引擎等生效 */
    importConfig(data: unknown): boolean {
      if (!data || typeof data !== 'object') return false;
      const d = data as Record<string, unknown>;
      if (d.version !== 1) return false;
      applyImportedConfig(
        this as unknown as Record<string, unknown>,
        d.config as Record<string, unknown> | undefined,
      );
      useSearchEnginesStore().applyImport({
        hiddenEngineIds: d.hiddenEngineIds,
        customEngines: d.customEngines,
        currentEngine: d.currentEngine,
      });
      if (Array.isArray(d.shortcuts)) {
        const list = d.shortcuts.filter(isShortcutItem);
        useShortcutsStore().replaceAll(list);
      }
      return true;
    },
  },
});

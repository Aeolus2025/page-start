import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage';
import type { ConfigState, ExportPayload } from '@/types';

const defaultBg = '/image.png';

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
      const rawHidden = getItem('hiddenEngineIds');
      const rawCustom = getItem('custom-engines');
      const configSnapshot = { ...this.$state };
      if (!this.exportIncludeBackground) {
        configSnapshot.backgroundImage = '';
      }
      return {
        version: 1,
        config: configSnapshot,
        hiddenEngineIds: (() => {
          try {
            const a = rawHidden == null ? [] : JSON.parse(rawHidden as string);
            return Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string') : [];
          } catch {
            return [];
          }
        })(),
        customEngines: (() => {
          try {
            const a = rawCustom == null ? [] : JSON.parse(rawCustom as string);
            return Array.isArray(a) ? a.filter((x) => x && typeof x.name === 'string' && typeof x.url === 'string') : [];
          } catch {
            return [];
          }
        })()
      };
    },
    /** 导入配置；返回 true 表示成功，建议调用后刷新页面以使引擎等生效 */
    importConfig(data: unknown): boolean {
      if (!data || typeof data !== 'object') return false;
      const d = data as Record<string, unknown>;
      if (d.version !== 1) return false;
      const config = d.config as Record<string, unknown> | undefined;
      if (config && typeof config === 'object') {
        if (typeof config.backgroundImage === 'string') {
          this.backgroundImage = config.backgroundImage;
          setItem('backgroundImage', this.backgroundImage);
        }
        if (typeof config.timeFormat24 === 'boolean') {
          this.timeFormat24 = config.timeFormat24;
          setItem('timeFormat24', this.timeFormat24);
        }
        if (typeof config.timeShowSeconds === 'boolean') {
          this.timeShowSeconds = config.timeShowSeconds;
          setItem('timeShowSeconds', this.timeShowSeconds);
        }
        if (['small', 'medium', 'large'].includes(config.timeFontSize as string)) {
          this.timeFontSize = config.timeFontSize as ConfigState['timeFontSize'];
          setItem('timeFontSize', this.timeFontSize);
        }
        if (config.timeFontWeight === 'bold' || config.timeFontWeight === 'normal') {
          this.timeFontWeight = config.timeFontWeight;
          setItem('timeFontWeight', this.timeFontWeight);
        }
        if (['normal', 'italic', 'script'].includes(config.timeFontStyle as string)) {
          this.timeFontStyle = config.timeFontStyle as ConfigState['timeFontStyle'];
          setItem('timeFontStyle', this.timeFontStyle);
        }
        if (typeof config.focusSearchOnLoad === 'boolean') {
          this.focusSearchOnLoad = config.focusSearchOnLoad;
          setItem('focusSearchOnLoad', this.focusSearchOnLoad);
        }
        if (typeof config.searchHistoryEnabled === 'boolean') {
          this.searchHistoryEnabled = config.searchHistoryEnabled;
          setItem('searchHistoryEnabled', this.searchHistoryEnabled);
        }
        if (typeof config.openSearchInNewTab === 'boolean') {
          this.openSearchInNewTab = config.openSearchInNewTab;
          setItem('openSearchInNewTab', this.openSearchInNewTab);
        }
        if (typeof config.exportIncludeBackground === 'boolean') {
          this.exportIncludeBackground = config.exportIncludeBackground;
          setItem('exportIncludeBackground', this.exportIncludeBackground);
        }
      }
      const hidden = d.hiddenEngineIds;
      if (Array.isArray(hidden)) {
        const ids = hidden.filter((x): x is string => typeof x === 'string');
        setItem('hiddenEngineIds', JSON.stringify(ids));
      }
      const custom = d.customEngines;
      if (Array.isArray(custom)) {
        const list = custom.filter((x) => x && typeof x.name === 'string' && typeof x.url === 'string');
        setItem('custom-engines', JSON.stringify(list));
      }
      return true;
    }
  }
});

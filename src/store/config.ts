import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage';
import type { ConfigState } from '@/types';

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
  openSearchInNewTab: false
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
      openSearchInNewTab: readBool('openSearchInNewTab', DEFAULT_CONFIG.openSearchInNewTab)
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
      setItem('backgroundImage', this.backgroundImage);
      setItem('timeFormat24', this.timeFormat24);
      setItem('timeShowSeconds', this.timeShowSeconds);
      setItem('timeFontSize', this.timeFontSize);
      setItem('timeFontWeight', this.timeFontWeight);
      setItem('timeFontStyle', this.timeFontStyle);
      setItem('focusSearchOnLoad', this.focusSearchOnLoad);
      setItem('searchHistoryEnabled', this.searchHistoryEnabled);
      setItem('openSearchInNewTab', this.openSearchInNewTab);
      setItem('hiddenEngineIds', '[]');
    }
  }
});

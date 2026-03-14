import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage';
import type { ConfigState } from '@/types';

const defaultBg = '/image.png';

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
      backgroundImage: readStr('backgroundImage', ''),
      timeFormat24: readBool('timeFormat24', true),
      timeShowSeconds: readBool('timeShowSeconds', false),
      timeFontSize: (readStr('timeFontSize', 'medium') as ConfigState['timeFontSize']) || 'medium',
      timeFontWeight: readStr('timeFontWeight', 'normal') === 'bold' ? 'bold' : 'normal',
      timeFontStyle: (readStr('timeFontStyle', 'normal') as ConfigState['timeFontStyle']) || 'normal',
      focusSearchOnLoad: readBool('focusSearchOnLoad', true)
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
    }
  }
});

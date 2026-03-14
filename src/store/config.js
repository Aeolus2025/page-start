import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage.js';

const defaultBg = '/image.png';

function readBool(key, defaultValue) {
  const v = getItem(key);
  if (v === null) return defaultValue;
  return v === 'true';
}

function readStr(key, defaultValue) {
  const v = getItem(key);
  return v !== null && v !== '' ? v : defaultValue;
}

export const useConfigStore = defineStore('config', {
  state() {
    return {
      // 背景图：自定义 URL 或 base64，空则用默认
      backgroundImage: readStr('backgroundImage', ''),
      // 时间：24 小时制
      timeFormat24: readBool('timeFormat24', true),
      // 时间：是否显示秒
      timeShowSeconds: readBool('timeShowSeconds', false),
      // 时间字体大小：small | medium | large
      timeFontSize: readStr('timeFontSize', 'medium'),
      // 时间字体粗细：normal(默认) | bold(加粗)，旧值 medium 视为 normal
      timeFontWeight: (() => {
        const v = readStr('timeFontWeight', 'normal');
        return v === 'bold' ? 'bold' : 'normal';
      })(),
      // 时间字体样式：normal(默认) | italic(斜体) | script(花体)
      timeFontStyle: readStr('timeFontStyle', 'normal'),
      // 页面加载时是否聚焦搜索栏
      focusSearchOnLoad: readBool('focusSearchOnLoad', true),
    };
  },
  getters: {
    /** 实际使用的背景图 URL（自定义或默认） */
    backgroundUrl(state) {
      return state.backgroundImage && state.backgroundImage.trim() !== ''
        ? state.backgroundImage.trim()
        : defaultBg;
    },
    hasCustomBackground(state) {
      return Boolean(state.backgroundImage && state.backgroundImage.trim() !== '');
    },
  },
  actions: {
    setBackgroundImage(url) {
      this.backgroundImage = url || '';
      setItem('backgroundImage', this.backgroundImage);
    },
    removeBackgroundImage() {
      this.backgroundImage = '';
      setItem('backgroundImage', '');
    },
    setTimeFormat24(value) {
      this.timeFormat24 = Boolean(value);
      setItem('timeFormat24', this.timeFormat24);
    },
    setTimeShowSeconds(value) {
      this.timeShowSeconds = Boolean(value);
      setItem('timeShowSeconds', this.timeShowSeconds);
    },
    setTimeFontSize(value) {
      const v = ['small', 'medium', 'large'].includes(value) ? value : 'medium';
      this.timeFontSize = v;
      setItem('timeFontSize', this.timeFontSize);
    },
    setTimeFontWeight(value) {
      const v = value === 'bold' ? 'bold' : 'normal';
      this.timeFontWeight = v;
      setItem('timeFontWeight', this.timeFontWeight);
    },
    setTimeFontStyle(value) {
      const v = ['normal', 'italic', 'script'].includes(value) ? value : 'normal';
      this.timeFontStyle = v;
      setItem('timeFontStyle', this.timeFontStyle);
    },
    setFocusSearchOnLoad(value) {
      this.focusSearchOnLoad = Boolean(value);
      setItem('focusSearchOnLoad', this.focusSearchOnLoad);
    },
  },
});

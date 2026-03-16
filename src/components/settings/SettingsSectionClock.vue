<template>
  <section class="settings-section">
    <h3 class="section-title">时间样式</h3>
    <div class="option-row">
      <span class="option-label">制式</span>
      <div class="option-group">
        <label class="radio-label">
          <input type="radio" :checked="config.timeFormat24" value="24" @change="config.setTimeFormat24(true)" />
          24 小时
        </label>
        <label class="radio-label">
          <input type="radio" :checked="!config.timeFormat24" value="12" @change="config.setTimeFormat24(false)" />
          12 小时
        </label>
      </div>
    </div>
    <div class="option-row">
      <span class="option-label">显示秒</span>
      <label class="switch-label">
        <input type="checkbox" :checked="config.timeShowSeconds" @change="onTimeShowSecondsChange" />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">字体大小</span>
      <select class="select" :value="config.timeFontSize" @change="onTimeFontSizeChange">
        <option value="small">小</option>
        <option value="medium">中</option>
        <option value="large">大</option>
      </select>
    </div>
    <div class="option-row">
      <span class="option-label">字体粗细</span>
      <select class="select" :value="config.timeFontWeight" @change="onTimeFontWeightChange">
        <option value="normal">默认</option>
        <option value="bold">加粗</option>
      </select>
    </div>
    <div class="option-row">
      <span class="option-label">字体样式</span>
      <select class="select" :value="config.timeFontStyle" @change="onTimeFontStyleChange">
        <option value="normal">默认</option>
        <option value="italic">斜体</option>
        <option value="script">花体</option>
      </select>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/store/config';

const config = useConfigStore();

function onTimeShowSecondsChange(e: Event) {
  config.setTimeShowSeconds((e.target as HTMLInputElement).checked);
}
function onTimeFontSizeChange(e: Event) {
  config.setTimeFontSize((e.target as HTMLSelectElement).value);
}
function onTimeFontWeightChange(e: Event) {
  config.setTimeFontWeight((e.target as HTMLSelectElement).value);
}
function onTimeFontStyleChange(e: Event) {
  config.setTimeFontStyle((e.target as HTMLSelectElement).value);
}
</script>

<style scoped>
.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--glass-divider);
}
.option-label { font-size: 14px; color: var(--glass-text); }
.option-group { display: flex; gap: 16px; }
.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--glass-text);
  cursor: pointer;
}
.radio-label input { cursor: pointer; }
.switch-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}
.switch-label input { opacity: 0; width: 0; height: 0; }
.switch-slider {
  position: absolute;
  inset: 0;
  background: var(--glass-input-border);
  border-radius: 24px;
  transition: background 0.25s;
}
.switch-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: var(--glass-bg-strong);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s;
}
.switch-label input:checked + .switch-slider { background: var(--color-accent); }
.switch-label input:checked + .switch-slider::before { transform: translateX(20px); }
.select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--glass-input-border);
  font-size: 14px;
  color: var(--glass-text);
  background: var(--glass-input-bg);
  cursor: pointer;
  min-width: 100px;
}

/* 深色主题：开关打开状态使用柔和一点的紫色，减少刺眼感（统一在 style.css 中配置颜色） */
[data-theme="dark"] .switch-label input:checked + .switch-slider {
  background: var(--switch-on-bg);
}
@media (prefers-color-scheme: dark) {
  [data-theme="system"] .switch-label input:checked + .switch-slider {
    background: var(--switch-on-bg);
  }
}
</style>

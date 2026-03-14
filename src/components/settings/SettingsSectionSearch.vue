<template>
  <section class="settings-section">
    <h3 class="section-title">搜索栏</h3>
    <div class="option-row">
      <span class="option-label">页面加载时聚焦搜索栏</span>
      <label class="switch-label">
        <input type="checkbox" :checked="config.focusSearchOnLoad" @change="onFocusSearchOnLoadChange" />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">启用搜索历史</span>
      <label class="switch-label">
        <input type="checkbox" :checked="config.searchHistoryEnabled" @change="onSearchHistoryChange" />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">在新标签页打开搜索结果</span>
      <label class="switch-label">
        <input type="checkbox" :checked="config.openSearchInNewTab" @change="onOpenSearchInNewTabChange" />
        <span class="switch-slider"></span>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/store/config';

const config = useConfigStore();

function onFocusSearchOnLoadChange(e: Event) {
  config.setFocusSearchOnLoad((e.target as HTMLInputElement).checked);
}

function onSearchHistoryChange(e: Event) {
  config.setSearchHistoryEnabled((e.target as HTMLInputElement).checked);
}

function onOpenSearchInNewTabChange(e: Event) {
  config.setOpenSearchInNewTab((e.target as HTMLInputElement).checked);
}
</script>

<style scoped>
.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
}
.option-label { font-size: 14px; color: rgba(0, 0, 0, 0.8); }
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
  background: rgba(0, 0, 0, 0.2);
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
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s;
}
.switch-label input:checked + .switch-slider { background: rgba(0, 0, 0, 0.6); }
.switch-label input:checked + .switch-slider::before { transform: translateX(20px); }
</style>

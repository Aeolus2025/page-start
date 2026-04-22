<template>
  <section class="settings-section">
    <h3 class="section-title">搜索栏</h3>
    <div class="option-row">
      <span class="option-label">页面加载时聚焦搜索栏</span>
      <label class="switch-label">
        <input
          id="focus-search-on-load"
          name="focusSearchOnLoadEnabled"
          type="checkbox"
          :checked="config.focusSearchOnLoadEnabled"
          aria-label="页面加载时聚焦搜索栏"
          @change="onFocusSearchOnLoadChange"
        />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">启用搜索历史</span>
      <label class="switch-label">
        <input
          id="search-history-enabled"
          name="searchHistoryEnabled"
          type="checkbox"
          :checked="config.searchHistoryEnabled"
          aria-label="启用搜索历史"
          @change="onSearchHistoryChange"
        />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">启用搜索建议</span>
      <label class="switch-label">
        <input
          id="search-suggest-enabled"
          name="searchSuggestEnabled"
          type="checkbox"
          :checked="config.searchSuggestEnabled"
          aria-label="启用搜索建议"
          @change="onSearchSuggestChange"
        />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">在新标签页打开搜索结果</span>
      <label class="switch-label">
        <input
          id="open-search-in-new-tab-enabled"
          name="openSearchInNewTabEnabled"
          type="checkbox"
          :checked="config.openSearchInNewTabEnabled"
          aria-label="在新标签页打开搜索结果"
          @change="onOpenSearchInNewTabChange"
        />
        <span class="switch-slider"></span>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/store/settings';

const config = useConfigStore();

function onFocusSearchOnLoadChange(e: Event) {
  config.setFocusSearchOnLoadEnabled((e.target as HTMLInputElement).checked);
}

function onSearchHistoryChange(e: Event) {
  config.setSearchHistoryEnabled((e.target as HTMLInputElement).checked);
}

function onSearchSuggestChange(e: Event) {
  config.setSearchSuggestEnabled((e.target as HTMLInputElement).checked);
}

function onOpenSearchInNewTabChange(e: Event) {
  config.setOpenSearchInNewTabEnabled((e.target as HTMLInputElement).checked);
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

.option-label {
  font-size: 14px;
  color: var(--glass-text);
}
.switch-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}
.switch-label input {
  opacity: 0;
  width: 0;
  height: 0;
}
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
.switch-label input:checked + .switch-slider {
  background: var(--switch-on-bg);
}
.switch-label input:checked + .switch-slider::before {
  transform: translateX(20px);
}
</style>

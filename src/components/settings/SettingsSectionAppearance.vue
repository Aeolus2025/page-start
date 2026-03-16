<template>
  <section class="settings-section">
    <h3 class="section-title">外观</h3>
    <div class="option-row">
      <span class="option-label">主题</span>
      <select
        class="select"
        :value="config.theme"
        aria-label="主题"
        @change="onThemeChange"
      >
        <option value="light">浅色</option>
        <option value="dark">深色</option>
        <option value="system">根据系统</option>
      </select>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/store/config';
import type { ThemeMode } from '@/types';

const config = useConfigStore();

function onThemeChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as ThemeMode;
  config.setTheme(value);
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
.select:focus {
  outline: none;
  border-color: var(--glass-border-strong);
}
</style>

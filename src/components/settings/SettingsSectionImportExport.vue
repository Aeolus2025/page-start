<template>
  <section class="settings-section">
    <h3 class="section-title">导入/导出配置</h3>
    <div class="option-row">
      <span class="option-label">导出背景图</span>
      <label class="switch-label">
        <input
          type="checkbox"
          :checked="config.exportBackgroundEnabled"
          @change="onExportBackgroundEnabledChange"
        />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">导出搜索引擎</span>
      <label class="switch-label">
        <input
          type="checkbox"
          :checked="config.exportSearchEnginesEnabled"
          @change="onExportSearchEnginesEnabledChange"
        />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">导出快捷方式</span>
      <label class="switch-label">
        <input
          type="checkbox"
          :checked="config.exportShortCutsEnabled"
          @change="onExportShortCutsEnabledChange"
        />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="import-export-row">
      <input
        ref="importInputRef"
        type="file"
        accept=".json,application/json"
        class="import-input"
        aria-hidden="true"
        @change="onImportFile"
      />
      <button type="button" class="btn-import" @click="triggerImport">导入配置</button>
      <button type="button" class="btn-export" @click="exportConfig">导出配置</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConfigStore } from '@/store/settings';

const config = useConfigStore();
const importInputRef = ref<HTMLInputElement | null>(null);

function triggerImport() {
  importInputRef.value?.click();
}

function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = reader.result as string;
      const data = JSON.parse(text);
      if (config.importConfig(data)) {
        window.location.reload();
      }
    } catch (_) {}
    input.value = '';
  };
  reader.readAsText(file, 'UTF-8');
}

function onExportBackgroundEnabledChange(e: Event) {
  config.setExportBackgroundEnabled((e.target as HTMLInputElement).checked);
}

function onExportSearchEnginesEnabledChange(e: Event) {
  config.setExportSearchEnginesEnabled((e.target as HTMLInputElement).checked);
}

function onExportShortCutsEnabledChange(e: Event) {
  config.setExportShortCutsEnabled((e.target as HTMLInputElement).checked);
}

function exportConfig() {
  try {
    const payload = config.exportConfig();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-start-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (_) {}
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 24px;
}

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

.import-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.import-export-row {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  padding-top: 12px;
}

.btn-import,
.btn-export {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg-strong);
  color: var(--glass-text);
}

.btn-import:hover,
.btn-export:hover {
  background: var(--glass-divider);
  color: var(--glass-text);
}
</style>

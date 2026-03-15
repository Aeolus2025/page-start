<template>
  <Teleport to="body">
    <Transition name="settings-fade">
      <div v-if="visible" class="settings-backdrop" @click.self="close">
        <div class="settings-panel">
          <div class="settings-header">
            <h2 class="settings-title">设置</h2>
            <button type="button" class="settings-close" aria-label="关闭" @click="close">×</button>
          </div>
          <div class="settings-body">
            <SettingsSectionBackground />
            <SettingsSectionClock />
            <SettingsSectionSearch />
            <section class="settings-section settings-section-import-export">
              <h3 class="section-title">导入/导出配置</h3>
              <div class="import-export-option">
                <span class="option-label">导出时包含背景图</span>
                <label class="switch-label">
                  <input type="checkbox" :checked="config.exportIncludeBackground" @change="onExportIncludeBackgroundChange" />
                  <span class="switch-slider"></span>
                </label>
              </div>
              <div class="import-export-row">
                <input
                  ref="importInputRef"
                  type="file"
                  accept=".json,application/json"
                  class="import-input"
                  @change="onImportFile"
                />
                <button type="button" class="btn-import" @click="triggerImport">导入</button>
                <button type="button" class="btn-export" @click="exportConfig">导出</button>
              </div>
            </section>
            <section class="settings-section settings-section-actions">
              <button type="button" class="btn-reset-defaults" @click="resetToDefaults">恢复所有默认配置</button>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SettingsSectionBackground from './settings/SettingsSectionBackground.vue';
import SettingsSectionClock from './settings/SettingsSectionClock.vue';
import SettingsSectionSearch from './settings/SettingsSectionSearch.vue';
import { useConfigStore } from '@/store/config';

withDefaults(defineProps<{ visible?: boolean }>(), { visible: false });

const emit = defineEmits<{ (e: 'close'): void }>();
const config = useConfigStore();
const importInputRef = ref<HTMLInputElement | null>(null);

function close() {
  emit('close');
}

function resetToDefaults() {
  config.resetToDefaults();
}

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

function onExportIncludeBackgroundChange(e: Event) {
  config.setExportIncludeBackground((e.target as HTMLInputElement).checked);
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
.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.settings-panel {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.settings-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.92);
}

.settings-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.72);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.settings-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.9);
}

.settings-body {
  overflow-y: auto;
  padding: 20px 24px 24px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section-actions {
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-reset-defaults {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.82);
  background: rgba(0, 0, 0, 0.06);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-reset-defaults:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.92);
}

.import-export-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  margin-bottom: 4px;
}
.import-export-option .option-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
}
.import-export-option .switch-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}
.import-export-option .switch-label input {
  opacity: 0;
  width: 0;
  height: 0;
}
.import-export-option .switch-slider {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  transition: background 0.25s;
}
.import-export-option .switch-slider::before {
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
.import-export-option .switch-label input:checked + .switch-slider {
  background: rgba(0, 0, 0, 0.65);
}
.import-export-option .switch-label input:checked + .switch-slider::before {
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
}

.btn-import,
.btn-export {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  color: rgba(0, 0, 0, 0.85);
}

.btn-import:hover,
.btn-export:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.92);
}

.btn-export {
  margin-left: 0;
}

.section-title {
  margin: 0 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.78);
}

.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 0.2s ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
}

.settings-fade-enter-active .settings-panel,
.settings-fade-leave-active .settings-panel {
  transition: transform 0.25s ease;
}

.settings-fade-enter-from .settings-panel,
.settings-fade-leave-to .settings-panel {
  transform: scale(0.96);
}
</style>

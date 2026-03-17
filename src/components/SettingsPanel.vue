<template>
  <Teleport to="body">
    <Transition name="settings-fade">
      <div v-if="visible" class="settings-backdrop" @click.self="close">
        <div
          class="settings-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          tabindex="-1"
        >
          <div class="settings-header">
            <h2 id="settings-title" class="settings-title">设置</h2>
            <button type="button" class="settings-close" aria-label="关闭" @click="close">×</button>
          </div>
          <div class="settings-body">
            <SettingsSectionAppearance />
            <SettingsSectionBackground />
            <SettingsSectionClock />
            <SettingsSectionSearch />
            <SettingsSectionImportExport />
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
import SettingsSectionAppearance from './settings/SettingsSectionAppearance.vue';
import SettingsSectionBackground from './settings/SettingsSectionBackground.vue';
import SettingsSectionClock from './settings/SettingsSectionClock.vue';
import SettingsSectionSearch from './settings/SettingsSectionSearch.vue';
import SettingsSectionImportExport from './settings/SettingsSectionImportExport.vue';
import { useConfigStore } from '@/store/settings';
import { useShortcutsStore } from '@/store/shortcuts';

withDefaults(defineProps<{ visible?: boolean }>(), { visible: false });

const emit = defineEmits<{ (e: 'close'): void }>();
const config = useConfigStore();
const shortcuts = useShortcutsStore();

function close() {
  emit('close');
}

function resetToDefaults() {
  config.resetToDefaults();
  shortcuts.clearAll();
  window.location.reload();
}
</script>

<style scoped>
.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--glass-scrim);
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
  background: var(--glass-bg);
  backdrop-filter: blur(22px);
  border-radius: 20px;
  box-shadow: none;
  border: 1px solid var(--glass-border);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-divider);
}

.settings-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--glass-text);
}

.settings-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--glass-divider);
  color: var(--glass-text-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.settings-close:hover {
  background: var(--glass-input-border);
  color: var(--glass-text);
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
  border-top: 1px solid var(--glass-divider);
}

.btn-reset-defaults {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  color: var(--glass-text);
  background: var(--glass-divider);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-reset-defaults:hover {
  background: var(--glass-input-border);
  color: var(--glass-text);
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

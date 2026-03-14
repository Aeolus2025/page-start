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
            <section class="settings-section settings-section-actions">
              <button type="button" class="btn-reset-defaults" @click="resetToDefaults">恢复默认配置</button>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import SettingsSectionBackground from './settings/SettingsSectionBackground.vue';
import SettingsSectionClock from './settings/SettingsSectionClock.vue';
import SettingsSectionSearch from './settings/SettingsSectionSearch.vue';
import { useConfigStore } from '@/store/config';

withDefaults(defineProps<{ visible?: boolean }>(), { visible: false });

const emit = defineEmits<{ (e: 'close'): void }>();
const config = useConfigStore();

function close() {
  emit('close');
}

function resetToDefaults() {
  config.resetToDefaults();
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
  color: rgba(0, 0, 0, 0.85);
}

.settings-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.6);
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
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.06);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-reset-defaults:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.85);
}

.section-title {
  margin: 0 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
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

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
            <!-- 背景图 -->
            <section class="settings-section">
              <h3 class="section-title">背景图</h3>
              <div class="bg-preview-wrap">
                <div class="bg-preview" :style="previewStyle"></div>
              </div>
              <div class="bg-actions">
                <label class="btn btn-primary">
                  <input type="file" accept="image/*" class="file-input" @change="onFileSelect" />
                  上传图片
                </label>
                <button type="button" class="btn btn-outline" :disabled="!config.hasCustomBackground" @click="removeBg">
                  删除自定义
                </button>
              </div>
            </section>

            <!-- 时间样式 -->
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
                  <input type="checkbox" :checked="config.timeShowSeconds" @change="config.setTimeShowSeconds($event.target.checked)" />
                  <span class="switch-slider"></span>
                </label>
              </div>
              <div class="option-row">
                <span class="option-label">字体大小</span>
                <select class="select" :value="config.timeFontSize" @change="config.setTimeFontSize($event.target.value)">
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
              <div class="option-row">
                <span class="option-label">字体粗细</span>
                <select class="select" :value="config.timeFontWeight" @change="config.setTimeFontWeight($event.target.value)">
                  <option value="normal">默认</option>
                  <option value="bold">加粗</option>
                </select>
              </div>
              <div class="option-row">
                <span class="option-label">字体样式</span>
                <select class="select" :value="config.timeFontStyle" @change="config.setTimeFontStyle($event.target.value)">
                  <option value="normal">默认</option>
                  <option value="italic">斜体</option>
                  <option value="script">花体</option>
                </select>
              </div>
            </section>

            <!-- 搜索栏 -->
            <section class="settings-section">
              <h3 class="section-title">搜索栏</h3>
              <div class="option-row">
                <span class="option-label">页面加载时聚焦搜索栏</span>
                <label class="switch-label">
                  <input type="checkbox" :checked="config.focusSearchOnLoad" @change="config.setFocusSearchOnLoad($event.target.checked)" />
                  <span class="switch-slider"></span>
                </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useConfigStore } from '@/store/config.js';

const props = defineProps({
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const config = useConfigStore();

const previewStyle = computed(() => ({
  backgroundImage: `url(${config.backgroundUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}));

function close() {
  emit('close');
}

function onFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    config.setBackgroundImage(reader.result);
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function removeBg() {
  config.removeBackgroundImage();
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

.section-title {
  margin: 0 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
}

.bg-preview-wrap {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
}

.bg-preview {
  height: 120px;
  width: 100%;
}

.bg-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background 0.2s, opacity 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: rgba(0, 0, 0, 0.75);
  color: white;
  position: relative;
}

.btn-primary:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.85);
}

.btn-outline {
  background: transparent;
  color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.btn-outline:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.06);
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.option-row:last-child {
  border-bottom: none;
}

.option-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
}

.option-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  cursor: pointer;
}

.radio-label input {
  cursor: pointer;
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

.switch-label input:checked + .switch-slider {
  background: rgba(0, 0, 0, 0.6);
}

.switch-label input:checked + .switch-slider::before {
  transform: translateX(20px);
}

.select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background: white;
  cursor: pointer;
  min-width: 100px;
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

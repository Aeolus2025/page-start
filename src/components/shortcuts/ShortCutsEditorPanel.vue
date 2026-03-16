<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="add-backdrop" @click.self="onCancel">
      <div class="add-modal" @mousedown.stop>
        <h3 class="add-title">{{ isEdit ? '修改快捷方式' : '添加快捷方式' }}</h3>
        <form class="add-form" @submit.prevent="handleSubmit">
          <div class="add-field">
            <label for="shortcut-name">名称</label>
            <input
              id="shortcut-name"
              v-model="localForm.name"
              type="text"
              placeholder="如：GitHub"
              required
              maxlength="32"
            />
          </div>
          <div class="add-field">
            <label for="shortcut-url">链接</label>
            <input
              id="shortcut-url"
              v-model="localForm.url"
              type="url"
              placeholder="https://..."
              required
            />
          </div>
          <div class="add-field">
            <label>图标（可选，不上传则使用链接默认图标）</label>
            <div class="add-icon-upload">
              <input
                id="shortcut-icon-file"
                type="file"
                accept="image/*"
                class="add-icon-input"
                @change="onIconFileChange"
              />
              <label for="shortcut-icon-file" class="add-icon-label">
                <img v-if="localForm.icon" :src="localForm.icon" class="add-icon-preview" alt="" />
                <span v-else class="add-icon-placeholder">上传图标</span>
              </label>
              <button
                v-if="localForm.icon"
                type="button"
                class="add-icon-clear"
                @click="clearIconUpload"
              >
                清除
              </button>
            </div>
          </div>
          <p v-if="error" class="add-error">{{ error }}</p>
          <div class="add-actions">
            <button type="button" class="btn-cancel" @click="onCancel">取消</button>
            <button type="submit" class="btn-submit">{{ isEdit ? '保存' : '添加' }}</button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { getShortcutFaviconUrl } from '@/utils/engine';

interface ShortcutFormValue {
  name: string;
  url: string;
  icon: string;
}

const props = withDefaults(defineProps<{
  modelValue: ShortcutFormValue;
  visible?: boolean;
  isEdit?: boolean;
}>(), {
  visible: false,
  isEdit: false,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'update:modelValue', value: ShortcutFormValue): void;
  (e: 'submit', value: ShortcutFormValue): void;
  (e: 'cancel'): void;
}>();

const localForm = reactive<ShortcutFormValue>({
  name: props.modelValue.name,
  url: props.modelValue.url,
  icon: props.modelValue.icon,
});

const error = ref('');

watch(
  () => props.modelValue,
  (val) => {
    localForm.name = val.name;
    localForm.url = val.url;
    localForm.icon = val.icon;
    error.value = '';
  },
  { deep: true }
);

watch(
  () => props.visible,
  (visible) => {
    document.body.style.overflow = visible ? 'hidden' : '';
    if (!visible) {
      error.value = '';
    }
  }
);

function normalizeUrl(url: string): string {
  const href = url.trim();
  return /^https?:\/\//i.test(href) ? href : `https://${href}`;
}

function onIconFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  input.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    localForm.icon = reader.result as string;
    emit('update:modelValue', { ...localForm });
  };
  reader.readAsDataURL(file);
}

function clearIconUpload() {
  localForm.icon = '';
  emit('update:modelValue', { ...localForm });
}

function handleSubmit() {
  error.value = '';
  const name = localForm.name.trim();
  const url = localForm.url.trim();
  if (!name || !url) {
    error.value = '请填写名称和链接';
    return;
  }
  const href = normalizeUrl(url);
  const icon = localForm.icon.trim() || getShortcutFaviconUrl(href);
  const iconVal = icon || '🔗';
  emit('submit', { name, url: href, icon: iconVal });
}

function onCancel() {
  emit('update:visible', false);
  emit('cancel');
}
</script>

<style scoped>
.add-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--glass-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-shadow: none;
}

.add-modal {
  width: 100%;
  max-width: 340px;
  background: var(--glass-bg);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: none;
  border: 1px solid var(--glass-border);
}

.add-title {
  margin: 0 0 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--glass-text);
}

.add-form label {
  display: block;
  font-size: 13px;
  color: var(--glass-text-muted);
  margin-bottom: 6px;
}

.add-field {
  margin-bottom: 16px;
}

.add-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--glass-input-border);
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  background: var(--glass-input-bg);
  color: var(--glass-text);
}

.add-field input::placeholder {
  color: var(--color-input-placeholder);
}

.add-field input[type="text"]:focus,
.add-field input[type="url"]:focus {
  outline: none;
  border-color: var(--glass-border-strong);
}

.add-icon-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-icon-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.add-icon-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: 1px dashed var(--glass-input-border);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}

.add-icon-label:hover {
  border-color: var(--glass-border-strong);
  background: var(--glass-divider);
}

.add-icon-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.add-icon-placeholder {
  font-size: 12px;
  color: var(--glass-text-muted);
}

.add-icon-clear {
  padding: 6px 12px;
  font-size: 13px;
  color: var(--glass-text-muted);
  background: var(--glass-divider);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.add-icon-clear:hover {
  background: var(--glass-input-border);
  color: var(--glass-text);
}

.add-error {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--color-danger);
}

.add-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background 0.2s, color 0.2s;
}

.btn-cancel {
  background: var(--glass-divider);
  color: var(--glass-text);
}

.btn-cancel:hover {
  background: var(--glass-input-border);
}

.btn-submit {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.btn-submit:hover {
  background: rgba(67, 56, 202, 1);
}

[data-theme="dark"] .add-backdrop {
  background: rgba(0, 0, 0, 0.28);
}
[data-theme="dark"] .add-modal {
  background: rgba(60, 60, 60, 0.96);
  border: 1px solid rgba(248, 250, 252, 0.22);
  box-shadow: none;
  outline: none;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
@media (prefers-color-scheme: dark) {
  [data-theme="system"] .add-backdrop {
    background: rgba(0, 0, 0, 0.28);
  }
  [data-theme="system"] .add-modal {
    background: rgba(60, 60, 60, 0.96);
    border: 1px solid rgba(248, 250, 252, 0.22);
    box-shadow: none;
    outline: none;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .add-modal,
.modal-fade-leave-active .add-modal {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from .add-modal,
.modal-fade-leave-to .add-modal {
  transform: scale(0.96);
}
</style>

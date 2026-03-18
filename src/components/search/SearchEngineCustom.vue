<template>
  <div v-if="visible" class="add-form">
    <input v-model="name" type="text" placeholder="名称" class="add-input" @input="addError = ''" />
    <input
      v-model="url"
      type="text"
      placeholder="搜索URL,需填完整地址(含%s,如 https://www.google.com/search?q=%s)"
      class="add-input"
      :class="{ 'add-input-error': addError }"
      @input="addError = ''"
    />
    <p v-if="addError" class="add-error">{{ addError }}</p>
    <div class="add-actions">
      <button type="button" class="add-btn cancel" @click="cancel">取消</button>
      <button type="button" class="add-btn confirm" @click="confirm">添加</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { validateSearchEngineUrl, normalizeSearchEngineUrl } from '@/utils/checkUrl';

const props = withDefaults(defineProps<{ visible?: boolean }>(), { visible: false });

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add', payload: { name: string; url: string }): void;
}>();

const name = ref('');
const url = ref('');
const addError = ref('');

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      name.value = '';
      url.value = '';
      addError.value = '';
    }
  },
);

function cancel() {
  emit('close');
}

function confirm() {
  const nameVal = name.value.trim();
  const urlRaw = url.value.trim() || '';
  if (!nameVal) {
    addError.value = '请填写引擎名称';
    return;
  }
  const result = validateSearchEngineUrl(urlRaw);
  if (!result.valid) {
    addError.value = result.message ?? '';
    return;
  }
  const urlNormalized = normalizeSearchEngineUrl(urlRaw);
  emit('add', { name: nameVal, url: urlNormalized });
  name.value = '';
  url.value = '';
  addError.value = '';
  emit('close');
}
</script>

<style scoped>
.add-form {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}
.add-input {
  width: 100%;
  max-width: 100%;
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 14px;
  box-sizing: border-box;
  min-width: 0;
}
.add-input-error {
  border-color: rgba(180, 83, 60, 0.55);
  background: rgba(180, 83, 60, 0.04);
}
.add-error {
  margin: 0 0 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.4;
}
.add-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.add-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
}
.add-btn.cancel {
  background: rgba(0, 0, 0, 0.08);
}
.add-btn.confirm {
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 1);
}
</style>

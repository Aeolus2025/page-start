<!-- 快捷方式面板 -->
<template>
  <div ref="wrapRef" class="shortcut-grid-wrap" :style="gridWrapStyle">
    <div class="grid" :class="{ 'grid-empty': shortcuts.items.length === 0 }">
      <ShortCutsCardButton
        v-for="item in shortcuts.items"
        :key="item.id"
        :item="item"
        @edit="openEdit"
        @remove="removeItem"
      />
      <button type="button" class="card add-card" aria-label="添加快捷方式" @click="openAdd">
        <span class="add-card-inner">
          <span class="add-card-icon">+</span>
        </span>
      </button>
    </div>

    <ShortCutsEditorPanel
      v-if="editorVisible"
      v-model:visible="editorVisible"
      :model-value="editorForm"
      :is-edit="Boolean(editingId)"
      @update:model-value="(v) => Object.assign(editorForm, v)"
      @submit="handleEditorSubmit"
      @cancel="handleEditorCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useShortcutsStore } from '@/store/shortcuts';
import { useShortCutsGridLayout } from '@/composables/useShortCutsGridLayout';
import type { ShortcutItem } from '@/types';
import ShortCutsCardButton from './shortcuts/ShortCutsCardButton.vue';
import ShortCutsEditorPanel from './shortcuts/ShortCutsEditorPanel.vue';

const emit = defineEmits<{ (e: 'editor-open-change', open: boolean): void }>();

const shortcuts = useShortcutsStore();
const wrapRef = ref<HTMLElement | null>(null);
const { gridWrapStyle } = useShortCutsGridLayout(wrapRef);

const editingId = ref<string | null>(null);
const editorVisible = ref(false);
watch(editorVisible, (open) => {
  emit('editor-open-change', open);
});
const editorForm = reactive<{ name: string; url: string; icon: string; disableAutoIcon: boolean }>({
  name: '',
  url: '',
  icon: '',
  disableAutoIcon: false,
});

function openAdd() {
  editingId.value = null;
  editorForm.name = '';
  editorForm.url = '';
  editorForm.icon = '';
  editorForm.disableAutoIcon = false;
  emit('editor-open-change', true);
  editorVisible.value = true;
}

function openEdit(item: ShortcutItem) {
  editingId.value = item.id;
  editorForm.name = item.name;
  editorForm.url = item.url;
  editorForm.icon = item.icon;
  editorForm.disableAutoIcon = Boolean(item.disableAutoIcon);
  emit('editor-open-change', true);
  editorVisible.value = true;
}

function removeItem(id: string) {
  shortcuts.remove(id);
}

function handleEditorSubmit(payload: {
  name: string;
  url: string;
  icon: string;
  disableAutoIcon: boolean;
}) {
  const isEdit = Boolean(editingId.value);
  try {
    if (isEdit && editingId.value) {
      shortcuts.update(editingId.value, payload);
    } else {
      // 新建快捷方式不继承“禁用自动 favicon”的状态，避免清除操作影响后续新增
      shortcuts.add({ ...payload, disableAutoIcon: false });
    }
    editorVisible.value = false;
    editingId.value = null;
  } catch {
    // 静默失败，表单组件已有基础校验
  }
}

function handleEditorCancel() {
  editorVisible.value = false;
  editingId.value = null;
}
</script>

<style scoped>
.shortcut-grid-wrap {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols, 4), 88px);
  gap: 20px;
  margin: 0;
  width: fit-content;
}

.grid-empty {
  justify-items: center;
}

.add-card {
  width: 88px;
  min-width: 88px;
  aspect-ratio: 1;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--glass-text);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-sizing: border-box;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-normal);
}

.add-card:hover {
  border-color: var(--glass-border-strong);
  background: var(--glass-bg-strong);
  box-shadow: none;
  transform: translateY(-2px) scale(1.02);
}

.add-card-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  border: none;
  background: transparent;
  box-sizing: border-box;
}

.add-card-icon {
  font-size: 22px;
  line-height: 1;
}
</style>

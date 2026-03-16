<!--
  快捷面板网格：展示用户快捷方式卡片与“添加”按钮；
  支持图标（URL/上传）、加载失败时回退为首字母；编辑/删除按钮悬停显示。
-->
<template>
  <div ref="wrapRef" class="shortcut-grid-wrap" :style="gridWrapStyle">
    <div class="grid" :class="{ 'grid-empty': shortcuts.items.length === 0 }">
      <ShortcutCard
        v-for="item in shortcuts.items"
        :key="item.id"
        :item="item"
        @edit="openEdit"
        @remove="removeItem"
      />
      <button type="button" class="card add-card" aria-label="添加快捷方式" @click="openAdd">
        <i class="iconfont icon-jia" aria-hidden="true"></i>
      </button>
    </div>

    <ShortcutEditor
      v-if="editorVisible"
      v-model:modelValue="editorForm"
      v-model:visible="editorVisible"
      :is-edit="Boolean(editingId)"
      @submit="handleEditorSubmit"
      @cancel="handleEditorCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useShortcutsStore } from '@/store/shortcuts';
import { useShortcutGridLayout } from '@/composables/useShortcutGridLayout';
import type { ShortcutItem } from '@/types';
import ShortcutCard from './ShortcutCard.vue';
import ShortcutEditor from './ShortcutEditor.vue';

const shortcuts = useShortcutsStore();
const wrapRef = ref<HTMLElement | null>(null);
const { gridWrapStyle } = useShortcutGridLayout(wrapRef);

const editingId = ref<string | null>(null);
const editorVisible = ref(false);
const editorForm = reactive<{ name: string; url: string; icon: string }>({
  name: '',
  url: '',
  icon: '',
});

function openAdd() {
  editingId.value = null;
  editorForm.name = '';
  editorForm.url = '';
  editorForm.icon = '';
  editorVisible.value = true;
}

function openEdit(item: ShortcutItem) {
  editingId.value = item.id;
  editorForm.name = item.name;
  editorForm.url = item.url;
  editorForm.icon = item.icon;
  editorVisible.value = true;
}

function removeItem(id: string) {
  shortcuts.remove(id);
}

function handleEditorSubmit(payload: { name: string; url: string; icon: string }) {
  const isEdit = Boolean(editingId.value);
  try {
    if (isEdit && editingId.value) {
      shortcuts.update(editingId.value, payload);
    } else {
      shortcuts.add(payload);
    }
    editorVisible.value = false;
    editingId.value = null;
  } catch {
    // 保持与原逻辑一致，仅静默失败即可，表单组件已有基础校验
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
  /* 空时仅一个添加按钮，保持居中 */
  justify-items: center;
}
.add-card .iconfont {
  font-size: 36px;
  color: inherit;
}
.add-card {
  border-style: dashed;
}
</style>

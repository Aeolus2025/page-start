<template>
  <div ref="blockRef" class="search-block">
    <div
      ref="wrapperRef"
      class="search-wrapper"
      :class="{ 'focused': isFocused || pickerVisible }"
      @contextmenu.stop.prevent="onWrapperContextMenu"
      @click="onWrapperClick"
    >
      <div
        v-show="isFocused || pickerVisible"
        class="engine-trigger"
        @click.stop="onEngineTriggerClick"
        @mousedown.prevent
        :title="currentEngine?.name"
      >
        <svg v-if="engineIconfontId" class="engine-icon engine-icon-svg" aria-hidden="true">
          <use :href="`#${engineIconfontId}`" />
        </svg>
        <img
          v-else-if="engineIconUrl"
          :src="engineIconUrl"
          :alt="currentEngine?.name"
          class="engine-icon"
          @error="engineIconError = true"
        />
        <span v-else class="engine-icon-fallback">{{ engineIconFallback }}</span>
        <span class="engine-chevron">▾</span>
      </div>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-input"
        :class="{ 'single': !isFocused && !pickerVisible }"
        :placeholder="(isFocused || pickerVisible) ? '输入以搜索...' : '搜索'"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleSearch"
      />
    </div>
    <EnginePicker
      v-model="currentEngine"
      v-model:visible="pickerVisible"
      inline
      @after-select="focusSearchInput"
    />
    <ContextMenu ref="contextMenuRef" :menuItems="searchMenuItems" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import ContextMenu from './ContextMenu.vue';
import EnginePicker from './EnginePicker.vue';
import { getEngineIconUrl, isIconfontSymbol } from '@/utils/engine';
import { useSelectedEngine } from '@/composables/useSelectedEngine';
import { useSearchFocus } from '@/composables/useSearchFocus';
import { useClipboardMenu } from '@/composables/useClipboardMenu';

const props = defineProps({
  shouldFocusOnMount: { type: Boolean, default: true },
  shortcutPanelOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['focus-change', 'picker-open']);

const query = ref('');
const inputRef = ref(null);
const wrapperRef = ref(null);
const blockRef = ref(null);
const contextMenuRef = ref(null);
const pickerVisible = ref(false);

// 选中引擎（持久化）
const { currentEngine } = useSelectedEngine();

// 聚焦/失焦（含切走切回）
const { isFocused, handleFocus, handleBlur } = useSearchFocus((focused) => {
  emit('focus-change', focused);
});

// 剪贴板右键菜单
const { searchMenuItems, openContextMenu: updateSelectionForMenu } = useClipboardMenu(query);

function onWrapperContextMenu(e) {
  updateSelectionForMenu(() => inputRef.value);
  contextMenuRef.value?.showMenu(e);
}

const onWrapperClick = (e) => {
  if (!isFocused.value && !pickerVisible.value && e.target === wrapperRef.value) {
    inputRef.value?.focus();
  }
};

const onEngineTriggerClick = () => {
  if (props.shortcutPanelOpen) return;
  pickerVisible.value = true;
};

// 引擎图标：优先 iconfont（与 kano 一致），否则 favicon，再否则首字
const engineIconError = ref(false);
const engineIconfontId = computed(() => {
  const icon = currentEngine.value?.icon;
  return icon && isIconfontSymbol(icon) ? icon.trim() : '';
});
const engineIconUrl = computed(() => {
  if (engineIconfontId.value || engineIconError.value) return '';
  return getEngineIconUrl(currentEngine.value) || '';
});
const engineIconFallback = computed(() => {
  const name = currentEngine.value?.name;
  return name ? name.slice(0, 1) : '🔍';
});
watch(currentEngine, () => { engineIconError.value = false; });

const focusSearchInput = () => {
  nextTick(() => inputRef.value?.focus());
};

// 点击外部关闭选择器
let clickOutsideCleanup = null;
watch(pickerVisible, (visible) => {
  emit('picker-open', visible);
  if (clickOutsideCleanup) {
    clickOutsideCleanup();
    clickOutsideCleanup = null;
  }
  if (visible) {
    nextTick(() => {
      inputRef.value?.focus();
      const onDocClick = (e) => {
        if (blockRef.value && !blockRef.value.contains(e.target)) {
          pickerVisible.value = false;
        }
      };
      document.addEventListener('mousedown', onDocClick);
      clickOutsideCleanup = () => document.removeEventListener('mousedown', onDocClick);
    });
  }
});

onUnmounted(() => {
  if (clickOutsideCleanup) clickOutsideCleanup();
});

const handleSearch = () => {
  const q = query.value.trim();
  if (!q) return;
  const url = (currentEngine.value?.url || '').replace('%s', encodeURIComponent(q));
  if (url) window.location.href = url;
};

onMounted(() => {
  if (props.shouldFocusOnMount) inputRef.value?.focus();
});
</script>

<style scoped>
.search-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 520px;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  transition: box-shadow 0.3s ease, background 0.3s ease;
}
.search-wrapper.focused {
  background: linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.18) 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.88);
}
.search-input::placeholder { color: rgba(0, 0, 0, 0.45); }
.search-input.single { text-align: center; }
.engine-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 6px 4px;
  margin-right: 4px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  color: rgba(0, 0, 0, 0.75);
  font-size: 14px;
  user-select: none;
}
.engine-trigger:hover { color: rgba(0, 0, 0, 0.9); }
.engine-icon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  object-fit: contain;
  display: block;
  filter: grayscale(100%) brightness(0.35) contrast(1.4);
}
.engine-icon-svg {
  flex-shrink: 0;
  fill: currentColor;
  color: rgba(0, 0, 0, 0.6);
  filter: none;
}
.engine-icon-fallback {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
}
.engine-chevron { font-size: 10px; opacity: 0.8; }
.search-block {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 520px;
}
</style>

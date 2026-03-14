<template>
  <div ref="blockRef" class="search-block">
    <div
      ref="wrapperRef"
      class="search-wrapper"
      :class="{ 'focused': isFocused || pickerVisible }"
      @contextmenu.stop.prevent="openContextMenu"
      @click="onWrapperClick"
    >
      <div
        v-show="isFocused || pickerVisible"
        class="engine-trigger"
        @click.stop="onEngineTriggerClick"
        @mousedown.prevent
      >
        <span class="engine-name">{{ currentEngine.name }}</span>
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

<script setup>
import { ref, onMounted, nextTick, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue';
import ContextMenu from './ContextMenu.vue';
import EnginePicker from './EnginePicker.vue';

const props = defineProps({
  shouldFocusOnMount: { type: Boolean, default: true },
  shortcutPanelOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['focus-change', 'picker-open']);
const query = ref('');
const isFocused = ref(false);
const inputRef = ref(null);
const wrapperRef = ref(null);
const blockRef = ref(null);
const contextMenuRef = ref(null);
const pickerVisible = ref(false);
const savedSelection = ref({ start: 0, end: 0 });

const defaultEngines = [
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=%s', icon: '🐾' },
  { id: 'google', name: '谷歌', url: 'https://www.google.com/search?q=%s', icon: 'G' },
  { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q=%s', icon: 'B' }
];

const loadSavedEngine = () => {
  try {
    const raw = localStorage.getItem('page-start-selected-engine');
    if (!raw) return defaultEngines[0];
    const o = JSON.parse(raw);
    const found = defaultEngines.find(e => e.id === o?.id) || defaultEngines.find(e => e.name === o?.name);
    if (found) return found;
    if (o?.name && o?.url) return { id: 'custom', ...o };
    return defaultEngines[0];
  } catch {
    return defaultEngines[0];
  }
};

const currentEngine = ref(loadSavedEngine() || defaultEngines[0]);

const saveEngine = (eng) => {
  try {
    localStorage.setItem('page-start-selected-engine', JSON.stringify({ id: eng?.id, name: eng?.name, url: eng?.url }));
  } catch (_) {}
};

const doCopy = () => {
  const { start, end } = savedSelection.value;
  const text = query.value.slice(start, end);
  if (text) navigator.clipboard?.writeText(text).catch(() => {});
};

const doCut = () => {
  const { start, end } = savedSelection.value;
  const text = query.value.slice(start, end);
  if (text) {
    navigator.clipboard?.writeText(text).then(() => {
      query.value = query.value.slice(0, start) + query.value.slice(end);
    }).catch(() => {});
  }
};

const doPaste = async () => {
  try {
    const text = await navigator.clipboard?.readText();
    if (text == null) return;
    const { start, end } = savedSelection.value;
    query.value = query.value.slice(0, start) + text + query.value.slice(end);
  } catch (_) {}
};

const searchMenuItems = computed(() => [
  { label: '剪切', shortcut: 'Ctrl+X', action: doCut },
  { label: '复制', shortcut: 'Ctrl+C', action: doCopy },
  { label: '粘贴', shortcut: 'Ctrl+V', action: doPaste }
]);

const openContextMenu = (e) => {
  const el = inputRef.value;
  if (el) {
    savedSelection.value = { start: el.selectionStart, end: el.selectionEnd };
  }
  contextMenuRef.value?.showMenu(e);
};

const onWrapperClick = (e) => {
  if (!isFocused.value && !pickerVisible.value && e.target === wrapperRef.value) {
    inputRef.value?.focus();
  }
};

const onEngineTriggerClick = () => {
  if (props.shortcutPanelOpen) return;
  pickerVisible.value = true;
};

const handleFocus = () => {
  isFocused.value = true;
  emit('focus-change', true);
};

// 切走/切回：不改变布局状态。blur 延迟执行，若在延迟内页面被隐藏则取消，保持离开前状态
let blurTimeoutId = null;

const handleBlur = () => {
  if (blurTimeoutId) clearTimeout(blurTimeoutId);
  blurTimeoutId = window.setTimeout(() => {
    blurTimeoutId = null;
    if (document.visibilityState === 'hidden') return;
    isFocused.value = false;
    emit('focus-change', false);
  }, 150);
};

watch(pickerVisible, (v) => emit('picker-open', v));

const focusSearchInput = () => {
  nextTick(() => inputRef.value?.focus());
};

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

const onVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    if (blurTimeoutId) {
      clearTimeout(blurTimeoutId);
      blurTimeoutId = null;
    }
  }
};

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (props.shouldFocusOnMount) inputRef.value?.focus();
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  if (blurTimeoutId) clearTimeout(blurTimeoutId);
});

watch(currentEngine, (v) => { if (v) saveEngine(v); }, { deep: true });
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
  gap: 4px;
  padding: 8px 12px 8px 4px;
  margin-right: 4px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  color: rgba(0, 0, 0, 0.75);
  font-size: 14px;
  user-select: none;
}
.engine-trigger:hover { color: rgba(0, 0, 0, 0.9); }
.engine-chevron { font-size: 10px; opacity: 0.8; }

.search-block {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 520px;
}
</style>

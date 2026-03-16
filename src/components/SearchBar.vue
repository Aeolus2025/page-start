<template>
  <div ref="blockRef" class="search-block">
    <div class="search-bar-and-history">
      <div
        ref="wrapperRef"
        class="search-wrapper"
        :class="{ 'focused': isFocused || pickerVisible }"
        @contextmenu.stop
        @click="onWrapperClick"
      >
        <div
          v-show="isFocused || pickerVisible"
          class="engine-trigger"
          @click.stop="onEngineTriggerClick"
          @mousedown.prevent
          :title="currentEngine?.name"
        >
          <EngineIcon
            :engine="currentEngine"
            :icon-error="engineIconError"
            @error="engineIconError = true"
          />
          <span class="engine-chevron">▾</span>
        </div>
        <div class="search-input-area">
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
          <i
            v-show="isFocused || pickerVisible"
            class="iconfont icon-sousuo search-icon"
            aria-label="搜索"
            title="搜索"
            @click.stop="handleSearch"
            @mousedown.prevent
          />
        </div>
      </div>
      <SearchHistoryDropdown
        :visible="showHistoryDropdown"
        :items="historyList"
        :width-style="historyDropdownWidthStyle"
        @select="onHistorySelect"
        @remove="removeHistoryItem"
        @clear="clearHistory"
      />
    </div>
    <EnginePicker
      v-model="currentEngine"
      v-model:visible="pickerVisible"
      inline
      @after-select="focusSearchInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import EnginePicker from './EnginePicker.vue';
import EngineIcon from './EngineIcon.vue';
import SearchHistoryDropdown from './SearchHistoryDropdown.vue';
import { useSelectedEngine } from '@/composables/useSelectedEngine';
import { useSearchFocus } from '@/composables/useSearchFocus';
import { useSearchHistory } from '@/composables/useSearchHistory';
import { useSearchNavigate } from '@/composables/useSearchNavigate';
import { useClickOutside } from '@/composables/useClickOutside';
import { useConfigStore } from '@/store/config';

interface SearchBarProps {
  shouldFocusOnMount?: boolean;
  shortcutPanelOpen?: boolean;
}

const props = defineProps<SearchBarProps>();

const emit = defineEmits<{
  'focus-change': [focused: boolean];
  'picker-open': [visible: boolean];
}>();

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const blockRef = ref<HTMLElement | null>(null);
const pickerVisible = ref(false);

const config = useConfigStore();
const { currentEngine } = useSelectedEngine();
const { isFocused, handleFocus, handleBlur } = useSearchFocus((focused) => {
  emit('focus-change', focused);
});
const { buildSearchUrl, navigateToSearchUrl } = useSearchNavigate(currentEngine);
const { history: searchHistory, addHistory, clearHistory, removeItem: removeHistoryItem } = useSearchHistory();
const showHistoryDropdown = computed(() => (isFocused.value || pickerVisible.value) && config.searchHistoryEnabled && !pickerVisible.value);
const historyList = computed(() => searchHistory.value);

useClickOutside(blockRef, () => { pickerVisible.value = false; }, pickerVisible);

const historyDropdownWidthStyle = ref<Record<string, string>>({});
function syncHistoryWidth() {
  if (!wrapperRef.value) return;
  const w = wrapperRef.value.getBoundingClientRect().width;
  historyDropdownWidthStyle.value = w > 0 ? { width: `${Math.round(w)}px` } : {};
}
watch([showHistoryDropdown, wrapperRef], () => {
  if (showHistoryDropdown.value) nextTick(syncHistoryWidth);
  else historyDropdownWidthStyle.value = {};
}, { immediate: true });
watch(showHistoryDropdown, (visible) => {
  if (visible) {
    nextTick(() => {
      syncHistoryWidth();
      requestAnimationFrame(syncHistoryWidth);
    });
    const onResize = () => syncHistoryWidth();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }
});

function onHistorySelect(keyword: string) {
  const url = buildSearchUrl(keyword);
  if (url) {
    addHistory(keyword, { persistOnly: !config.openSearchInNewTab });
    navigateToSearchUrl(url);
  } else {
    query.value = keyword;
    inputRef.value?.focus();
  }
}

const onWrapperClick = (e: MouseEvent) => {
  if (!isFocused.value && !pickerVisible.value && e.target === wrapperRef.value) {
    inputRef.value?.focus();
  }
};

const onEngineTriggerClick = () => {
  if (props.shortcutPanelOpen) return;
  pickerVisible.value = true;
};

const engineIconError = ref(false);
watch(currentEngine, () => { engineIconError.value = false; });

const focusSearchInput = () => {
  nextTick(() => inputRef.value?.focus());
};

watch(pickerVisible, (visible) => {
  emit('picker-open', visible);
  if (visible) nextTick(() => inputRef.value?.focus());
});

const handleSearch = () => {
  const q = query.value.trim();
  if (!q) return;
  const url = buildSearchUrl(q);
  if (!url) return;
  addHistory(q, { persistOnly: !config.openSearchInNewTab });
  navigateToSearchUrl(url);
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
  min-width: 0;
  max-width: 520px;
  min-height: 48px;
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 24px;
  /* 非聚焦默认：浅色更亮更暖；深色更暗更克制（由 token 控制） */
  background: var(--sb-bg-idle);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--sb-border-idle);
  /* 默认态：无整体矩形阴影，仅依靠背景与虚化营造层级 */
  box-shadow: none;
  transition:
    box-shadow var(--transition-normal),
    background var(--transition-normal),
    border-color var(--transition-normal),
    transform var(--transition-fast);
  overflow: hidden;
}
.search-wrapper:hover:not(.focused) {
  /* 非聚焦 + 悬停：浅色逐步变亮变实；深色逐步变暗变实 */
  background: var(--sb-bg-hover);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-color: var(--sb-border-hover);
  /* 取消外部矩形投影，仅保留边缘高亮 */
  box-shadow: 0 0 0 1px var(--color-accent-soft);
}
.search-wrapper.focused {
  background: var(--color-input-bg-strong);
  /* 聚焦态：边框更清晰但无大块阴影，保持干净 */
  border-color: var(--color-input-border-strong);
  box-shadow: none;
}
.search-input-area {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}
.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 15px;
  color: var(--color-text-primary);
}
.search-input::placeholder {
  color: var(--color-input-placeholder);
}
.search-input.single { text-align: center; }
/* 仅搜索图标靠右：与左侧 padding-left: 1px 对应，用负 margin 贴右边缘 */
.search-icon {
  flex-shrink: 0;
  width: 44px;
  height: 48px;
  margin-left: auto;
  margin-right: -9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-icon-muted);
  transition: color var(--transition-fast), transform var(--transition-fast);
  box-sizing: border-box;
}
.search-icon:hover {
  color: var(--color-accent);
  transform: translateY(-1px);
}
.engine-trigger {
  flex-shrink: 0;
  width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
  cursor: pointer;
  color: var(--color-icon-muted);
  font-size: 14px;
  user-select: none;
  box-sizing: border-box;
}
.engine-trigger:hover {
  color: var(--color-accent);
}
.engine-chevron { font-size: 10px; opacity: 0.8; }
.search-block {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 520px;
  min-width: 0;
  position: relative;
  box-sizing: border-box;
  /* 组件级色板：浅色逐步变亮变实；深色逐步变暗变实 */
  --sb-bg-idle: rgba(255, 252, 240, 0.35);
  --sb-border-idle: rgba(255, 250, 230, 0.7);
  --sb-bg-hover: rgba(255, 252, 240, 0.75);
  --sb-border-hover: rgba(255, 252, 240, 0.95);
  --sb-shadow-hover: none;
}

[data-theme="dark"] .search-block {
  --sb-bg-idle: rgba(60, 60, 60, 0.35);
  --sb-border-idle: rgba(248, 250, 252, 0.18);
  --sb-bg-hover: rgba(60, 60, 60, 0.58);
  --sb-border-hover: rgba(248, 250, 252, 0.26);
  --sb-shadow-hover: none;
}
@media (prefers-color-scheme: dark) {
  [data-theme="system"] .search-block {
    --sb-bg-idle: rgba(60, 60, 60, 0.35);
    --sb-border-idle: rgba(248, 250, 252, 0.18);
    --sb-bg-hover: rgba(60, 60, 60, 0.58);
    --sb-border-hover: rgba(248, 250, 252, 0.26);
    --sb-shadow-hover: none;
  }
}
.search-bar-and-history {
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 520px;
  box-sizing: border-box;
  overflow: hidden;
}

@media (max-width: 640px) {
  .search-wrapper {
    min-height: 52px;
    padding-inline: 16px;
  }
}
</style>

<template>
  <div ref="blockRef" class="search-block">
    <div class="search-bar-and-history">
      <div
        ref="wrapperRef"
        class="search-wrapper"
        :class="{ focused: isFocused || pickerVisible }"
        @contextmenu.stop
        @click="onWrapperClick"
      >
        <div
          v-show="isFocused || pickerVisible"
          class="engine-trigger"
          role="button"
          tabindex="0"
          :title="currentEngine?.name"
          @click.stop="onEngineTriggerClick"
          @mousedown.prevent
          @keydown.enter.prevent.stop="onEngineTriggerClick"
          @keydown.space.prevent.stop="onEngineTriggerClick"
        >
          <SearchEngineIcon
            :engine="currentEngine"
            :icon-error="engineIconError"
            @error="engineIconError = true"
          />
          <span class="engine-chevron">▾</span>
        </div>
        <div class="search-input-area">
          <label for="global-search-input" class="sr-only">搜索内容</label>
          <input
            id="global-search-input"
            ref="inputRef"
            v-model="query"
            name="searchQuery"
            type="text"
            class="search-input"
            :class="{ single: !isFocused && !pickerVisible }"
            :placeholder="isFocused || pickerVisible ? '输入以搜索...' : '搜索'"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown="onInputKeydown"
            @keyup.enter="handleSearch"
          />
          <i
            v-show="isFocused || pickerVisible"
            class="iconfont icon-sousuo search-icon"
            role="button"
            tabindex="0"
            aria-label="搜索"
            title="搜索"
            @click.stop="handleSearch"
            @mousedown.prevent
            @keydown.enter.prevent.stop="handleSearch"
            @keydown.space.prevent.stop="handleSearch"
          />
        </div>
      </div>
      <SearchHistory
        :visible="showHistoryDropdown"
        :items="historyList"
        :width-style="historyDropdownWidthStyle"
        :highlight-index="historyHighlightIndex"
        @select="onHistorySelect"
        @remove="removeHistoryItem"
        @clear="clearHistory"
      />
      <SearchSuggest
        :visible="showSuggestDropdown"
        :items="suggestions"
        :loading="suggestLoading"
        :width-style="historyDropdownWidthStyle"
        :highlight-index="suggestHighlightIndex"
        @select="onSuggestSelect"
      />
    </div>
    <SearchEnginePickerPanel
      v-model="currentEngine"
      v-model:visible="pickerVisible"
      inline
      @after-select="focusSearchInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import SearchEnginePickerPanel from './search/SearchEnginePickerPanel.vue';
import SearchEngineIcon from './search/SearchEngineIcon.vue';
import SearchHistory from './search/SearchHistory.vue';
import SearchSuggest from './search/SearchSuggest.vue';
import { useSelectedEngine } from '@/composables/useSelectedEngine';
import { useSearchFocus } from '@/composables/useSearchFocus';
import { useSearchHistory } from '@/composables/useSearchHistory';
import { useSearchSuggest } from '@/composables/useSearchSuggest';
import { useSearchNavigate } from '@/composables/useSearchNavigate';
import { useClickOutside } from '@/composables/useClickOutside';
import { useConfigStore } from '@/store/settings';

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
const {
  history: searchHistory,
  addHistory,
  clearHistory,
  removeItem: removeHistoryItem,
  refresh: refreshHistory,
} = useSearchHistory();
const searchSuggestEnabledRef = computed(() => config.searchSuggestEnabled);
const {
  suggestions,
  loading: suggestLoading,
  highlightIndex: suggestHighlightIndex,
  incHighlight: suggestIncHighlight,
  decHighlight: suggestDecHighlight,
} = useSearchSuggest(query, currentEngine, searchSuggestEnabledRef);
const showSuggestDropdown = computed(
  () =>
    isFocused.value &&
    !pickerVisible.value &&
    query.value.trim() !== '' &&
    config.searchSuggestEnabled,
);
const showHistoryDropdown = computed(
  () =>
    isFocused.value &&
    !pickerVisible.value &&
    query.value.trim() === '' &&
    config.searchHistoryEnabled,
);
const historyList = computed(() => searchHistory.value);
const historyHighlightIndex = ref(-1);

function historyIncHighlight() {
  const max = historyList.value.length - 1;
  if (max < 0) return;
  historyHighlightIndex.value = Math.min(historyHighlightIndex.value + 1, max);
}

function historyDecHighlight() {
  historyHighlightIndex.value = Math.max(historyHighlightIndex.value - 1, -1);
}

watch(showHistoryDropdown, (visible) => {
  if (!visible) historyHighlightIndex.value = -1;
});

useClickOutside(
  blockRef,
  () => {
    pickerVisible.value = false;
  },
  pickerVisible,
);

const historyDropdownWidthStyle = ref<Record<string, string>>({});
function syncHistoryWidth() {
  if (!wrapperRef.value) return;
  const w = wrapperRef.value.getBoundingClientRect().width;
  historyDropdownWidthStyle.value = w > 0 ? { width: `${Math.round(w)}px` } : {};
}
const showAnyDropdown = computed(() => showHistoryDropdown.value || showSuggestDropdown.value);
watch(
  [showAnyDropdown, wrapperRef],
  () => {
    if (showAnyDropdown.value) {
      if (showHistoryDropdown.value) refreshHistory();
      nextTick(syncHistoryWidth);
    } else {
      historyDropdownWidthStyle.value = {};
    }
  },
  { immediate: true },
);
watch(showAnyDropdown, (visible) => {
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
    addHistory(keyword, { persistOnly: !config.openSearchInNewTabEnabled });
    navigateToSearchUrl(url);
  } else {
    query.value = keyword;
    inputRef.value?.focus();
  }
}

function onSuggestSelect(selected: string) {
  const url = buildSearchUrl(selected);
  if (url) {
    addHistory(selected, { persistOnly: !config.openSearchInNewTabEnabled });
    navigateToSearchUrl(url);
  } else {
    query.value = selected;
    inputRef.value?.focus();
  }
}

function onInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    pickerVisible.value = false;
    inputRef.value?.blur();
    return;
  }
  if (showSuggestDropdown.value && suggestions.value.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      suggestIncHighlight();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      suggestDecHighlight();
      return;
    }
    if (e.key === 'Enter' && suggestHighlightIndex.value >= 0) {
      const item = suggestions.value[suggestHighlightIndex.value];
      if (item != null) {
        e.preventDefault();
        suggestSelectHandled.value = true;
        onSuggestSelect(item);
      }
      return;
    }
    return;
  }

  if (showHistoryDropdown.value && historyList.value.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      historyIncHighlight();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      historyDecHighlight();
      return;
    }
    if (e.key === 'Enter' && historyHighlightIndex.value >= 0) {
      const item = historyList.value[historyHighlightIndex.value];
      if (item != null) {
        e.preventDefault();
        onHistorySelect(item);
      }
    }
  }
}

function focusInput() {
  nextTick(() => inputRef.value?.focus());
}

function exitSearch() {
  pickerVisible.value = false;
  inputRef.value?.blur();
}

defineExpose({ focusInput, exitSearch });

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
const suggestSelectHandled = ref(false);
watch(currentEngine, () => {
  engineIconError.value = false;
});

// 搜索栏真正失焦（退出搜索态）后清空输入内容
watch(isFocused, (focused) => {
  if (focused) return;
  query.value = '';
  historyHighlightIndex.value = -1;
  suggestHighlightIndex.value = -1;
});

function shouldAutoFocusNow() {
  if (!props.shouldFocusOnMount) return false;
  if (props.shortcutPanelOpen) return false;
  if (document.visibilityState !== 'visible') return false;
  if (!document.hasFocus()) return false;
  const ae = document.activeElement as HTMLElement | null;
  // 已在搜索框则无需处理
  if (ae === inputRef.value) return false;
  // 若用户正在输入其它控件，不抢焦点
  if (ae && ['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName)) return false;
  return true;
}

function tryAutoFocus() {
  if (!shouldAutoFocusNow()) return;
  const el = inputRef.value;
  if (!el) return;
  // 短窗口重试，避免新标签打开时地址栏抢焦点导致第一次 focus 失效
  requestAnimationFrame(() => {
    if (!shouldAutoFocusNow()) return;
    el.focus({ preventScroll: true });
    setTimeout(() => {
      if (!shouldAutoFocusNow()) return;
      el.focus({ preventScroll: true });
    }, 50);
  });
}

const focusSearchInput = () => {
  nextTick(() => inputRef.value?.focus());
};

watch(pickerVisible, (visible) => {
  emit('picker-open', visible);
  if (visible) nextTick(() => inputRef.value?.focus());
});

const handleSearch = () => {
  if (suggestSelectHandled.value) {
    suggestSelectHandled.value = false;
    return;
  }
  const q = query.value.trim();
  if (!q) return;
  addHistory(q, { persistOnly: !config.openSearchInNewTabEnabled });
  const url = buildSearchUrl(q);
  if (!url) return;
  navigateToSearchUrl(url);
};

onMounted(() => {
  tryAutoFocus();
});

function onWindowFocus() {
  // 若处于“搜索展开态”但因为窗口失焦导致 input 被 blur，则在回到窗口时恢复 focus
  if (!isFocused.value) return;
  if (document.activeElement === inputRef.value) return;
  nextTick(() => inputRef.value?.focus());
}

onMounted(() => {
  window.addEventListener('focus', onWindowFocus);
});

onUnmounted(() => {
  window.removeEventListener('focus', onWindowFocus);
});

function onVisibilityChange() {
  if (document.visibilityState === 'visible') tryAutoFocus();
}

function onPageShow() {
  tryAutoFocus();
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pageshow', onPageShow);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('pageshow', onPageShow);
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
  background: var(--sb-bg-idle);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--sb-border-idle);
  box-shadow: none;
  transition:
    box-shadow var(--transition-normal),
    background var(--transition-normal),
    border-color var(--transition-normal),
    transform var(--transition-fast);
  overflow: hidden;
}
.search-wrapper:hover:not(.focused) {
  background: var(--sb-bg-hover);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-color: var(--sb-border-hover);
  box-shadow: 0 0 0 1px var(--color-accent-soft);
}
.search-wrapper.focused {
  background: var(--color-input-bg-strong);
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
.search-input.single {
  text-align: center;
}
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
  transition:
    color var(--transition-fast),
    transform var(--transition-fast);
  box-sizing: border-box;
}
.search-icon:hover {
  color: var(--color-accent);
  transform: translateY(-1px);
}
.engine-trigger {
  flex-shrink: 0;
  width: 32px;
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
.engine-chevron {
  font-size: 10px;
  opacity: 0.8;
}
.search-block {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 520px;
  min-width: 0;
  position: relative;
  box-sizing: border-box;
  --sb-bg-idle: rgba(255, 252, 240, 0.35);
  --sb-border-idle: rgba(255, 250, 230, 0.7);
  --sb-bg-hover: rgba(255, 252, 240, 0.75);
  --sb-border-hover: rgba(255, 252, 240, 0.95);
  --sb-shadow-hover: none;
}
[data-theme='dark'] .search-block {
  --sb-bg-idle: rgba(60, 60, 60, 0.35);
  --sb-border-idle: rgba(248, 250, 252, 0.18);
  --sb-bg-hover: rgba(60, 60, 60, 0.58);
  --sb-border-hover: rgba(248, 250, 252, 0.26);
  --sb-shadow-hover: none;
}
@media (prefers-color-scheme: dark) {
  [data-theme='system'] .search-block {
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
  overflow: visible;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 640px) {
  .search-wrapper {
    min-height: 52px;
    padding-inline: 16px;
  }
}
</style>

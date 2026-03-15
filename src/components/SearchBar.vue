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

const props = defineProps({
  shouldFocusOnMount: { type: Boolean, default: true },
  shortcutPanelOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['focus-change', 'picker-open']);

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
  addHistory(q, { persistOnly: !config.openSearchInNewTab });
  navigateToSearchUrl(buildSearchUrl(q));
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
  background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  transition: box-shadow 0.3s ease, background 0.3s ease;
  overflow: hidden;
}
.search-wrapper.focused {
  background: linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.18) 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding-left: 9px;
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
  color: rgba(0, 0, 0, 0.92);
}
.search-input::placeholder { color: rgba(0, 0, 0, 0.6); }
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
  color: rgba(0, 0, 0, 0.68);
  transition: color 0.2s;
  box-sizing: border-box;
}
.search-icon:hover { color: rgba(0, 0, 0, 0.9); }
.engine-trigger {
  flex-shrink: 0;
  width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  user-select: none;
  box-sizing: border-box;
}
.engine-trigger:hover { color: rgba(0, 0, 0, 0.95); }
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
}
.search-bar-and-history {
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 520px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>

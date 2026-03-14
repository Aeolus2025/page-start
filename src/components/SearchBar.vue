<template>
  <div ref="blockRef" class="search-block">
    <div class="search-bar-and-history">
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
        <i v-show="isFocused || pickerVisible" class="iconfont icon-sousuo search-icon" aria-hidden="true"></i>
      </div>
      <Transition name="history-drop">
        <div
          v-if="showHistoryDropdown && historyList.length > 0"
          class="search-history-dropdown"
          :style="historyDropdownWidthStyle"
          @mousedown.prevent
        >
          <ul class="search-history-list" role="listbox">
            <li
              v-for="(item, idx) in historyList"
              :key="idx"
              class="search-history-item"
              role="option"
              @mousedown="onHistorySelect(item)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </Transition>
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
import { useSearchHistory } from '@/composables/useSearchHistory';
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
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);
const pickerVisible = ref(false);

const config = useConfigStore();
const { currentEngine } = useSelectedEngine();
const { isFocused, handleFocus, handleBlur } = useSearchFocus((focused) => {
  emit('focus-change', focused);
});
const { history: searchHistory, addHistory } = useSearchHistory();
const showHistoryDropdown = computed(() => (isFocused.value || pickerVisible.value) && config.searchHistoryEnabled && !pickerVisible.value);
const historyList = computed(() => searchHistory.value);

const historyDropdownWidthStyle = ref<{ width?: string }>({});
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

function buildSearchUrl(keyword: string): string {
  const url = currentEngine.value?.url || '';
  return url ? url.replace('%s', encodeURIComponent(keyword.trim())) : '';
}

function navigateToSearchUrl(url: string) {
  if (!url) return;
  if (config.openSearchInNewTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
}

function onHistorySelect(keyword: string) {
  const url = buildSearchUrl(keyword);
  if (url) {
    addHistory(keyword, { persistOnly: true });
    navigateToSearchUrl(url);
  } else {
    query.value = keyword;
    inputRef.value?.focus();
  }
}

// 剪贴板右键菜单
const { searchMenuItems, openContextMenu: updateSelectionForMenu } = useClipboardMenu(query);

function onWrapperContextMenu(e: MouseEvent) {
  updateSelectionForMenu(() => inputRef.value);
  contextMenuRef.value?.showMenu(e);
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
let clickOutsideCleanup: (() => void) | null = null;
watch(pickerVisible, (visible) => {
  emit('picker-open', visible);
  if (clickOutsideCleanup) {
    clickOutsideCleanup();
    clickOutsideCleanup = null;
  }
  if (visible) {
    nextTick(() => {
      inputRef.value?.focus();
      const onDocClick = (e: MouseEvent) => {
        if (blockRef.value && !blockRef.value.contains(e.target as Node)) {
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
  addHistory(q, { persistOnly: true });
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
.search-icon {
  flex-shrink: 0;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.5);
  margin-left: 4px;
}
.engine-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 6px 2px;
  margin-right: 2px;
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
  position: relative;
}
.search-bar-and-history {
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 520px;
  box-sizing: border-box;
}
.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  box-sizing: border-box;
  margin-top: 6px;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 10;
}
.search-history-list {
  margin: 0;
  padding: 8px 0;
  list-style: none;
}
.search-history-item {
  padding: 10px 20px;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  transition: background 0.15s;
}
.search-history-item:hover {
  background: rgba(255, 255, 255, 0.2);
}
.history-drop-enter-active,
.history-drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.history-drop-enter-from,
.history-drop-leave-to { opacity: 0; transform: translateY(-4px); }
.history-drop-enter-to,
.history-drop-leave-from { opacity: 1; transform: translateY(0); }
</style>

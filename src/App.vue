<template>
  <div class="container" @contextmenu.prevent="handleContainerContextMenu">
    <div class="background-layer" :class="{ 'is-blur': searchFocused || showShortcutPanel }" :style="backgroundStyle"></div>

    <div class="content-layer" :class="{ 'shifted': contentShifted }">
      <div class="clock-column">
        <DigitalClock />
      </div>
      <div class="search-gap" aria-hidden="true"></div>
      <div class="content-block" ref="contentBlockRef">
        <SearchBar
          v-if="!showShortcutPanel"
          :should-focus-on-mount="focusSearchOnMount"
          :shortcut-panel-open="showShortcutPanel"
          @focus-change="handleFocusChange"
          @picker-open="handlePickerOpen"
        />
        <Transition name="slide-down">
          <div
            v-if="showShortcutPanel"
            class="shortcut-sheet"
            :class="{ 'has-modal-open': shortcutEditorOpen }"
            @contextmenu.stop.prevent
          >
            <ShortCutsPanel @editor-open-change="shortcutEditorOpen = $event" />
          </div>
        </Transition>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showShortcutPanel" class="settings-fab" @click="openSettings" title="设置"><i class="iconfont icon-shezhi"></i></div>
    </Transition>
    <SettingsPanel :visible="settingsVisible" @close="settingsVisible = false" />
  </div>
</template>

<script setup lang="ts">
/**
 * 根组件：背景、时钟、搜索栏 / 快捷面板切换、设置入口。
 * 右键空白处打开快捷面板，点击 contentBlock 外关闭。
 */
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';
import { useShortCutsPanel } from '@/composables/useShortCutsPanel';
import DigitalClock from './components/DigitalClock.vue';
import SearchBar from './components/search/SearchBar.vue';
import ShortCutsPanel from './components/ShortCutsPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const config = useConfigStore();
const { focusSearchOnLoad, theme } = storeToRefs(config);

function applyTheme(mode: string) {
  document.documentElement.setAttribute('data-theme', mode);
}
onMounted(() => applyTheme(theme.value));
watch(theme, (mode) => applyTheme(mode));

const contentBlockRef = ref<HTMLElement | null>(null);
const {
  showShortcutPanel,
  panelJustClosed,
  openShortcutPanel,
} = useShortCutsPanel(contentBlockRef);

const focusSearchOnMount = computed(() => focusSearchOnLoad.value && !panelJustClosed.value);
const backgroundStyle = computed(() => ({ backgroundImage: `url(${config.backgroundUrl})` }));

const searchFocused = ref(false);
const settingsVisible = ref(false);
const pickerOpen = ref(false);
const shortcutEditorOpen = ref(false);

const contentShifted = ref(false);
function updateShifted() {
  contentShifted.value = searchFocused.value || showShortcutPanel.value || pickerOpen.value;
}

watch(showShortcutPanel, (visible) => {
  if (!visible) {
    searchFocused.value = false;
  }
  updateShifted();
});

function handleFocusChange(status: boolean) {
  searchFocused.value = status;
  updateShifted();
}

function handlePickerOpen(open: boolean) {
  pickerOpen.value = open;
  updateShifted();
}

function handleContainerContextMenu(_e: MouseEvent) {
  if (showShortcutPanel.value) return;
  if (pickerOpen.value) return;
  openShortcutPanel();
  updateShifted();
}

function openSettings() {
  settingsVisible.value = true;
}
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  min-height: 100%;
  overflow-y: auto;
  overflow-y: overlay;
}
.container {
  position: relative;
  min-height: 100dvh;
  width: 100%;
}
.background-layer {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(var(--bg-layer-brightness));
  background-color: rgba(0, 0, 0, 1);
  transition: filter var(--transition-normal), transform var(--transition-normal), opacity var(--transition-normal);
  z-index: 1;
}
.background-layer.is-blur {
  filter: brightness(var(--bg-layer-blur-brightness)) blur(18px);
  transform: scale(1.04);
}
.content-layer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 28vh;
  padding-bottom: 2rem;
  z-index: 2;
  transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.content-layer.shifted { padding-top: 18vh; }
/* 恢复搜索框到原始位置（以默认/中等时钟 4rem 为准）；固定高度+时钟居中，仅时钟位移、搜索框不动 */
.clock-column {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 520px;
  height: 4rem;
  min-height: 4rem;
  flex-shrink: 0;
  box-sizing: border-box;
  overflow: visible;
}
.content-layer .search-gap { height: 1.5rem; flex-shrink: 0; }
.content-block {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  outline: none;
  box-shadow: none;
}
.content-block:focus-within,
.shortcut-sheet:focus-within {
  outline: none;
}
.shortcut-sheet {
  outline: none;
}
.settings-fab {
  position: fixed; top: 16px; right: 16px; z-index: 5;
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  color: var(--glass-icon);
  font-size: 20px;
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: none;
}
.settings-fab:hover {
  background: var(--glass-bg-strong);
  transform: scale(1.05) translateY(-1px);
  box-shadow: none;
  border-color: var(--glass-border-strong);
}
/* 快捷面板：不设 box-shadow，避免深浅色主题下四角出现直角阴影 */
.shortcut-sheet {
  align-self: center;
  width: fit-content;
  min-width: 100%;
  max-width: 700px;
  padding: 20px;
  background: var(--shortcut-sheet-bg);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--shortcut-sheet-border-color);
  border-radius: 24px;
  box-shadow: none;
  /* 关键：裁剪 backdrop-filter 的绘制区域，避免出现“直角模糊/阴影” */
  overflow: hidden;
  isolation: isolate;
  box-sizing: border-box;
  color: var(--glass-text);
}
.shortcut-sheet.has-modal-open:focus-within {
  outline: none;
}

/* 兜底：弹窗打开时，禁用快捷面板区域内的焦点环/阴影，避免出现直角矩形框（outline 不跟随圆角） */
.shortcut-sheet.has-modal-open :focus-visible {
  outline: none !important;
}
.shortcut-sheet.has-modal-open,
.shortcut-sheet.has-modal-open * {
  box-shadow: none !important;
}
.slide-down-enter-active,
.slide-down-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
.slide-down-enter-to,
.slide-down-leave-from { opacity: 1; transform: translateY(0); }
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-to,
.fade-leave-from { opacity: 1; }

@media (max-width: 640px) {
  .content-layer {
    padding-top: 24vh;
  }
  .content-layer.shifted {
    padding-top: 16vh;
  }
  .shortcut-sheet {
    max-width: 100%;
    border-radius: 20px;
    padding: 16px;
  }
  .settings-fab {
    top: 12px;
    right: 12px;
  }
}
</style>

<template>
  <div class="container" @contextmenu.prevent="(e) => showShortcutPanel ? e.preventDefault() : onContainerContextMenu(e)">
    <div class="background-layer" :class="{ 'is-blur': searchFocused || showShortcutPanel }" :style="backgroundStyle"></div>

    <!-- 时钟+搜索：始终显示；聚焦或任意面板打开时整体上移 -->
    <div class="content-layer" :class="{ 'shifted': contentShifted }">
      <div class="clock-spacer" aria-hidden="true"></div>
      <div class="search-gap" aria-hidden="true"></div>
      <div class="content-block" ref="contentBlockRef">
        <!-- 未打开快捷面板：显示搜索框 -->
        <SearchBar
          v-if="!showShortcutPanel"
          :should-focus-on-mount="focusSearchOnMount"
          :shortcut-panel-open="showShortcutPanel"
          @focus-change="handleFocusChange"
          @picker-open="handlePickerOpen"
        />
        <!-- 右键打开快捷面板时：替换搜索框，原 slide-down 动画不变 -->
        <Transition name="slide-down">
          <div
            v-if="showShortcutPanel"
            class="shortcut-sheet"
            @contextmenu.stop.prevent
          >
            <ShortcutGrid />
          </div>
        </Transition>
      </div>
    </div>

    <div class="clock-layer" :class="{ 'shifted': contentShifted }">
      <DigitalClock />
    </div>

    <!-- 设置按钮：右上角常显 -->
    <div class="settings-fab" @click="openSettings" title="设置">⚙️</div>

    <SettingsPanel :visible="settingsVisible" @close="settingsVisible = false" />
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onUnmounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config.js';
import DigitalClock from './components/DigitalClock.vue';
import SearchBar from './components/SearchBar.vue';
import ShortcutGrid from './components/ShortcutGrid.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const config = useConfigStore();
const { focusSearchOnLoad } = storeToRefs(config);

const focusSearchOnMount = computed(() => {
  return focusSearchOnLoad.value && !panelJustClosed.value;
});

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${config.backgroundUrl})`,
}));

const searchFocused = ref(false);
const settingsVisible = ref(false);
const showShortcutPanel = ref(false);
const panelJustClosed = ref(false);
const pickerOpen = ref(false);
const contentBlockRef = ref(null);

const contentShifted = ref(false);
const updateShifted = () => {
  contentShifted.value = searchFocused.value || showShortcutPanel.value || pickerOpen.value;
};

let shortcutClickCleanup = null;
let contextMenuBlockCleanup = null;

// 快捷面板打开时：在捕获阶段拦截所有右键（含空白），不弹出、不触发打开
const onContextMenuBlock = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

function installContextMenuBlock() {
  if (contextMenuBlockCleanup) return;
  window.addEventListener('contextmenu', onContextMenuBlock, true);
  document.addEventListener('contextmenu', onContextMenuBlock, true);
  contextMenuBlockCleanup = () => {
    window.removeEventListener('contextmenu', onContextMenuBlock, true);
    document.removeEventListener('contextmenu', onContextMenuBlock, true);
    contextMenuBlockCleanup = null;
  };
}

watch(showShortcutPanel, (visible) => {
  if (shortcutClickCleanup) {
    shortcutClickCleanup();
    shortcutClickCleanup = null;
  }
  if (contextMenuBlockCleanup) {
    contextMenuBlockCleanup();
    contextMenuBlockCleanup = null;
  }
  if (visible) {
    installContextMenuBlock();
    nextTick(() => {
      const onDocClick = (e) => {
        if (contentBlockRef.value && !contentBlockRef.value.contains(e.target)) {
          closeShortcutPanel();
        }
      };
      document.addEventListener('mousedown', onDocClick);
      shortcutClickCleanup = () => document.removeEventListener('mousedown', onDocClick);
    });
  }
});
onUnmounted(() => {
  if (shortcutClickCleanup) shortcutClickCleanup();
  if (contextMenuBlockCleanup) contextMenuBlockCleanup();
});

const handleFocusChange = (status) => {
  searchFocused.value = status;
  updateShifted();
};

const handlePickerOpen = (open) => {
  pickerOpen.value = open;
  updateShifted();
};

const onContainerContextMenu = (e) => {
  if (showShortcutPanel.value) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  if (pickerOpen.value) return;
  openShortcutPanel();
};

const openShortcutPanel = () => {
  showShortcutPanel.value = true;
  updateShifted();
  installContextMenuBlock();
};

const closeShortcutPanel = () => {
  panelJustClosed.value = true;
  showShortcutPanel.value = false;
  updateShifted();
  nextTick(() => { panelJustClosed.value = false; });
};

const openSettings = () => {
  settingsVisible.value = true;
};
</script>

<style>
/* 全局样式清理 */
body, html, #app { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }

.container { position: relative; height: 100vh; width: 100vw; }

.background-layer {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.5s ease; z-index: 1;
}
.background-layer.is-blur { filter: brightness(0.7) blur(15px); transform: scale(1.05); }

/* 默认布局层：初始位置 28vh，上移态 18vh，过渡流畅 */
.content-layer {
  position: absolute; top: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center;
  padding-top: 28vh; z-index: 2;
  transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.content-layer.shifted { padding-top: 18vh; }
.clock-spacer { height: 4rem; flex-shrink: 0; }
.content-layer .search-gap { height: 1.5rem; flex-shrink: 0; }

.content-block {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 520px;
}

/* 时钟层：与内容层同步上移 */
.clock-layer {
  position: absolute; top: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center;
  padding-top: 28vh; z-index: 4; pointer-events: none;
  transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.clock-layer.shifted { padding-top: 18vh; }
.clock-layer > * { pointer-events: auto; }

/* 设置按钮：固定屏幕右上角 */
.settings-fab {
  position: fixed; top: 16px; right: 16px; z-index: 5;
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
  color: white; font-size: 20px; cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.settings-fab:hover { background: rgba(255, 255, 255, 0.35); transform: scale(1.05); }

/* 快捷面板：替换搜索框同 slot，同风格 */
.shortcut-sheet {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.slide-down-enter-active,
.slide-down-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
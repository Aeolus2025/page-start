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
          <div v-if="showShortcutPanel" class="shortcut-sheet" @contextmenu.stop.prevent>
            <ShortcutGrid />
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
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';
import { useShortcutPanel } from '@/composables/useShortcutPanel';
import DigitalClock from './components/DigitalClock.vue';
import SearchBar from './components/SearchBar.vue';
import ShortcutGrid from './components/ShortcutGrid.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const config = useConfigStore();
const { focusSearchOnLoad } = storeToRefs(config);

const contentBlockRef = ref(null);
const {
  showShortcutPanel,
  panelJustClosed,
  openShortcutPanel,
} = useShortcutPanel(contentBlockRef);

const focusSearchOnMount = computed(() => focusSearchOnLoad.value && !panelJustClosed.value);
const backgroundStyle = computed(() => ({ backgroundImage: `url(${config.backgroundUrl})` }));

const searchFocused = ref(false);
const settingsVisible = ref(false);
const pickerOpen = ref(false);

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
body, html, #app { margin: 0; padding: 0; min-height: 100%; overflow-y: auto; overflow-y: overlay; }
.container { position: relative; min-height: 100vh; width: 100%; }
.background-layer {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.5s ease; z-index: 1;
}
.background-layer.is-blur { filter: brightness(0.7) blur(15px); transform: scale(1.05); }
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
}
.settings-fab {
  position: fixed; top: 16px; right: 16px; z-index: 5;
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
  color: white; font-size: 20px; cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.settings-fab:hover { background: rgba(255, 255, 255, 0.35); transform: scale(1.05); }
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
.slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
.slide-down-enter-to,
.slide-down-leave-from { opacity: 1; transform: translateY(0); }
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-to,
.fade-leave-from { opacity: 1; }
</style>

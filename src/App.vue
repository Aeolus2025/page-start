<template>
  <div class="container" @contextmenu.prevent="showShortcutPanel = true">
    <div class="background-layer" :class="{ 'is-blur': searchFocused || showShortcutPanel }"></div>

    <div class="content-layer" v-if="!showShortcutPanel">
      <DigitalClock />
      <SearchBar @focus-change="handleFocusChange" />
    </div>

    <div class="shortcut-overlay" v-if="showShortcutPanel" @click.self="showShortcutPanel = false">
      <div class="top-bar">
        <div class="settings-icon" @click="console.log('打开设置')">⚙️</div>
      </div>
      <ShortcutGrid />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DigitalClock from './components/DigitalClock.vue';
import SearchBar from './components/SearchBar.vue';
import ShortcutGrid from './components/ShortcutGrid.vue';

const searchFocused = ref(false); // 搜索框聚焦状态
const showShortcutPanel = ref(false); // 控制快捷图标面板显示

const handleFocusChange = (status) => {
  searchFocused.value = status;
};
</script>

<style>
/* 全局样式清理 */
body, html, #app { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }

.container { position: relative; height: 100vh; width: 100vw; }

.background-layer {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: url('/background.jpg') no-repeat center center/cover;
  transition: all 0.5s ease; z-index: 1;
}
.background-layer.is-blur { filter: brightness(0.7) blur(15px); transform: scale(1.05); }

/* 默认布局层 */
.content-layer {
  position: absolute; top: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center;
  padding-top: 15vh; z-index: 2;
}

/* 快捷面板层 */
.shortcut-overlay {
  position: absolute; top: 0; width: 100%; height: 100%;
  z-index: 3; display: flex; flex-direction: column; align-items: center; padding-top: 10vh;
}
.top-bar { width: 90%; display: flex; justify-content: flex-end; gap: 20px; color: white; font-size: 24px; cursor: pointer; }
</style>
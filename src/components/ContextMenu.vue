<template>
  <teleport to="body">
    <div
      v-show="visible"
      class="context-menu"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      @click.stop
    >
      <slot>
        <div
          v-for="(item, index) in props.menuItems"
          :key="index"
          class="menu-item"
          @click="() => { item.action(); hideMenu(); }"
        >
          <span class="menu-label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</span>
        </div>
      </slot>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ContextMenuItem } from '@/types';

const props = withDefaults(defineProps<{ menuItems?: ContextMenuItem[] }>(), {
  menuItems: (): ContextMenuItem[] => []
});

const visible = ref(false);
const position = ref({ x: 0, y: 0 });

function hideMenu() {
  visible.value = false;
  document.removeEventListener('click', hideMenu);
  document.removeEventListener('contextmenu', hideMenu);
}

function showMenu(event: MouseEvent) {
  position.value = { x: event.clientX, y: event.clientY };
  visible.value = true;
  document.addEventListener('click', hideMenu);
  document.addEventListener('contextmenu', hideMenu);
}

defineExpose({ showMenu });
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: opacity 0.2s, transform 0.2s;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: rgba(245, 245, 245, 1);
}

.menu-shortcut {
  color: rgba(102, 102, 102, 1);
  font-size: 12px;
}
</style>

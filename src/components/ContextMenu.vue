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
          v-for="(item, index) in menuItems" 
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

<script>
export default {
  props: {
    menuItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      position: { x: 0, y: 0 }
    }
  },
  methods: {
    showMenu(event) {
      this.position = { x: event.clientX, y: event.clientY }
      this.visible = true
      document.addEventListener('click', this.hideMenu)
      document.addEventListener('contextmenu', this.hideMenu)
    },
    hideMenu() {
      this.visible = false
      document.removeEventListener('click', this.hideMenu)
      document.removeEventListener('contextmenu', this.hideMenu)
    }
  }
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
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
  background-color: #f5f5f5;
}

.menu-shortcut {
  color: #999;
  font-size: 12px;
}
</style>
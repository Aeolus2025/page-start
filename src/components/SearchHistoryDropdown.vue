<template>
  <Transition name="history-drop">
    <div
      v-if="visible && items.length > 0"
      class="search-history-dropdown"
      :style="widthStyle"
      @mousedown.prevent
    >
      <ul class="search-history-list" role="listbox">
        <li
          v-for="(item, idx) in items"
          :key="idx"
          class="search-history-item"
          role="option"
          @mousedown="$emit('select', item)"
        >
          <span class="search-history-item-text">{{ item }}</span>
          <i
            class="iconfont icon-cha search-history-item-remove"
            aria-label="删除"
            @mousedown.stop.prevent="$emit('remove', item)"
          />
        </li>
      </ul>
      <button
        type="button"
        class="search-history-clear"
        @mousedown.prevent="$emit('clear')"
      >
        <i class="iconfont icon-top" aria-hidden="true"></i>
        <span>清除历史记录</span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  items: string[];
  widthStyle: Record<string, string>;
}>();

defineEmits<{
  (e: 'select', item: string): void;
  (e: 'remove', item: string): void;
  (e: 'clear'): void;
}>();
</script>

<style scoped>
.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin-top: 6px;
  max-height: 280px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(248,250,252,0.96) 0%, rgba(226,232,240,0.92) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-subtle);
  z-index: 10;
}
.search-history-list {
  margin: 0;
  padding: 8px 0;
  list-style: none;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.search-history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.search-history-item:hover {
  background: var(--color-accent-soft);
}
.search-history-item-text {
  flex: 1;
  min-width: 0;
}
.search-history-item-remove {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 2px;
  transition: color var(--transition-fast), transform var(--transition-fast);
}
.search-history-item-remove:hover {
  color: var(--color-accent);
  transform: translateY(-1px);
}
.search-history-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 20px;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(148, 163, 184, 0.45);
  background: transparent;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.search-history-clear:hover {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
.search-history-clear .iconfont {
  font-size: 16px;
}
.history-drop-enter-active,
.history-drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.history-drop-enter-from,
.history-drop-leave-to { opacity: 0; transform: translateY(-4px); }
.history-drop-enter-to,
.history-drop-leave-from { opacity: 1; transform: translateY(0); }
</style>

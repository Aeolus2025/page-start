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
  color: rgba(0, 0, 0, 0.92);
  cursor: pointer;
  transition: background 0.15s;
}
.search-history-item:hover {
  background: rgba(255, 255, 255, 0.2);
}
.search-history-item-text {
  flex: 1;
  min-width: 0;
}
.search-history-item-remove {
  flex-shrink: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  padding: 2px;
  transition: color 0.15s;
}
.search-history-item-remove:hover {
  color: rgba(0, 0, 0, 0.9);
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
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.82);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.search-history-clear:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(0, 0, 0, 0.95);
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

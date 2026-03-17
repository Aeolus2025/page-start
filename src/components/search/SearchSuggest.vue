<script setup lang="ts">
import { ref, toRef } from 'vue';
import { useScrollIntoViewOnHighlight } from '@/composables/useScrollIntoViewOnHighlight';

const props = defineProps<{
  visible: boolean;
  items: string[];
  loading: boolean;
  widthStyle: Record<string, string>;
  highlightIndex: number;
}>();

defineEmits<{
  (e: 'select', item: string): void;
}>();

const listRef = ref<HTMLUListElement | null>(null);

useScrollIntoViewOnHighlight(listRef, toRef(props, 'highlightIndex'), { enabled: toRef(props, 'visible') });
</script>

<template>
  <Transition name="suggest-drop">
    <div
      v-if="visible && (items.length > 0 || loading)"
      class="search-suggest-dropdown"
      :style="widthStyle"
      role="listbox"
      :aria-busy="loading"
      @mousedown.prevent
    >
      <ul v-if="loading && items.length === 0" class="search-suggest-list" role="list">
        <li class="search-suggest-item search-suggest-loading">加载中…</li>
      </ul>
      <ul v-else ref="listRef" class="search-suggest-list" role="listbox">
        <li
          v-for="(item, idx) in items"
          :key="idx"
          class="search-suggest-item"
          :class="{ 'is-highlighted': highlightIndex === idx }"
          role="option"
          :aria-selected="highlightIndex === idx"
          @mousedown="$emit('select', item)"
        >
          <span class="search-suggest-item-text">{{ item }}</span>
        </li>
      </ul>
    </div>
  </Transition>
</template>

<style scoped>
.search-suggest-dropdown {
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
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.96) 0%, rgba(226, 232, 240, 0.92) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-subtle);
  z-index: 10;
}
.search-suggest-list {
  margin: 0;
  padding: 8px 0;
  list-style: none;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.search-suggest-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 15px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.search-suggest-item:hover,
.search-suggest-item.is-highlighted {
  background: var(--color-accent-soft);
}
.search-suggest-item-text {
  flex: 1;
  min-width: 0;
}
.search-suggest-loading {
  color: var(--color-text-secondary);
  cursor: default;
}

/* 深色模式：与搜索栏一致 */
[data-theme="dark"] .search-suggest-dropdown {
  background: linear-gradient(135deg, rgba(60, 60, 60, 0.96) 0%, rgba(45, 45, 45, 0.92) 100%);
  border-color: rgba(248, 250, 252, 0.18);
}
@media (prefers-color-scheme: dark) {
  [data-theme="system"] .search-suggest-dropdown {
    background: linear-gradient(135deg, rgba(60, 60, 60, 0.96) 0%, rgba(45, 45, 45, 0.92) 100%);
    border-color: rgba(248, 250, 252, 0.18);
  }
}

.suggest-drop-enter-active,
.suggest-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.suggest-drop-enter-from,
.suggest-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.suggest-drop-enter-to,
.suggest-drop-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

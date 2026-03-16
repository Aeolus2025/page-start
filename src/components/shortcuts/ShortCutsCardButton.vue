<template>
  <a
    class="card card-link"
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="card-actions">
      <button
        type="button"
        class="card-edit"
        aria-label="修改"
        title="修改"
        @click.prevent.stop="emit('edit', item)"
      >
        <i class="iconfont icon-xiugai" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        class="card-remove"
        aria-label="删除"
        title="删除"
        @click.prevent.stop="emit('remove', item.id)"
      >
        <i class="iconfont icon-top" aria-hidden="true"></i>
      </button>
    </div>

    <div v-if="iconUrl && !iconError" class="card-icon-wrap">
      <img
        class="card-icon-img"
        :src="iconUrl"
        :alt="item.name"
        loading="lazy"
        @error="iconError = true"
      />
    </div>
    <div v-else-if="iconUrl && iconError" class="card-icon-wrap card-icon-letter-wrap">
      <span class="card-icon-letter">{{ firstLetter }}</span>
    </div>
    <div v-else class="card-icon-wrap card-icon-letter-wrap">
      <span class="card-icon-letter">{{ firstLetter }}</span>
    </div>
    <p>{{ item.name }}</p>
  </a>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ShortcutItem } from '@/types';
import { getFirstLetter, isIconUrl } from '@/utils/shortcutIcon';

const props = defineProps<{
  item: ShortcutItem;
}>();

const emit = defineEmits<{
  (e: 'edit', item: ShortcutItem): void;
  (e: 'remove', id: string): void;
}>();

const iconError = ref(false);

const iconUrl = computed(() => (isIconUrl(props.item.icon) ? props.item.icon : ''));
const firstLetter = computed(() => getFirstLetter(props.item.name));
</script>

<style scoped>
.card {
  width: 88px;
  min-width: 88px;
  aspect-ratio: 1;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--glass-text);
  text-shadow: none;
  box-shadow: none;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast), background var(--transition-normal);
  text-decoration: none;
  box-sizing: border-box;
  position: relative;
}

button.card {
  font: inherit;
  padding: 0;
}

.card-link:hover {
  background: var(--glass-bg-strong);
  transform: translateY(-2px) scale(1.02);
  box-shadow: none;
  border-color: var(--glass-border-strong);
}

.card-actions {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  border-radius: 20px;
}

.card-actions button {
  pointer-events: auto;
}

.card-link .card-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.card-link:hover .card-actions {
  opacity: 1;
}

.card-edit,
.card-remove {
  position: absolute;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: color 0.2s, background 0.2s;
}

.card-edit {
  top: 6px;
  left: 6px;
}

.card-remove {
  top: 6px;
  right: 6px;
}

.card-edit:hover,
.card-remove:hover {
  color: rgba(255, 255, 255, 0.98);
  background: rgba(0, 0, 0, 0.35);
}

.card-edit .iconfont,
.card-remove .iconfont {
  font-size: 11px;
}

.card .icon {
  font-size: 28px;
  line-height: 1.2;
  margin-bottom: 4px;
}

.card-icon-wrap {
  width: 40px;
  height: 40px;
  margin-bottom: 4px;
  border-radius: 10px;
  background: var(--glass-bg-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card .card-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.card-icon-letter-wrap {
  font-size: 18px;
  font-weight: 600;
  color: var(--glass-text);
  line-height: 1;
}

.card-icon-letter {
  user-select: none;
}

.card p {
  margin: 0;
  font-size: 12px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}
</style>

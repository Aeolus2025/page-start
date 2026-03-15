<template>
  <svg v-if="iconfontId" class="engine-icon engine-icon-svg" :class="sizeClass" aria-hidden="true">
    <use :href="`#${iconfontId}`" />
  </svg>
  <img
    v-else-if="iconUrl && !iconError"
    :src="iconUrl"
    :alt="engine?.name"
    class="engine-icon engine-icon-img"
    :class="sizeClass"
    @error="$emit('error')"
  />
  <span v-else class="engine-icon engine-icon-fallback" :class="sizeClass">{{ fallback }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getEngineIconUrl, isIconfontSymbol } from '@/utils/engine';
import type { SearchEngine } from '@/types';

const props = withDefaults(
  defineProps<{
    engine: SearchEngine | null | undefined;
    /** 图片加载失败时由父组件传入，避免重复请求 */
    iconError?: boolean;
    /** 小号用于搜索栏触发区，中号用于选择器列表 */
    size?: 'small' | 'medium';
  }>(),
  { iconError: false, size: 'small' }
);

const sizeClass = computed(() => `size-${props.size}`);

defineEmits<{ (e: 'error'): void }>();

const iconfontId = computed(() => {
  const icon = props.engine?.icon;
  return icon && isIconfontSymbol(icon) ? icon.trim() : '';
});

const iconUrl = computed(() => {
  if (iconfontId.value || props.iconError) return '';
  return getEngineIconUrl(props.engine) || '';
});

const fallback = computed(() => {
  const name = props.engine?.name;
  return name ? name.slice(0, 1) : '🔍';
});
</script>

<style scoped>
.engine-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: block;
}
.engine-icon-svg {
  fill: currentColor;
  color: rgba(0, 0, 0, 0.75);
}
.engine-icon-img {
  border-radius: 4px;
  object-fit: contain;
  filter: grayscale(100%) brightness(0.35) contrast(1.4);
}
.engine-icon-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.82);
}
.size-medium.engine-icon { width: 28px; height: 28px; }
.size-medium.engine-icon-fallback { font-size: 18px; }
</style>

<template>
  <svg v-if="iconfontId" class="engine-icon engine-icon-svg" :class="sizeClass" aria-hidden="true">
    <use :href="`#${iconfontId}`" />
  </svg>
  <span v-else class="engine-icon engine-icon-fallback" :class="sizeClass">
    <span v-show="showFallbackLetter" class="engine-icon-fallback-letter">{{ fallback }}</span>
    <img
      v-if="iconUrl"
      v-show="showImg && !probedIconError"
      :src="iconUrl"
      :alt="engine?.name"
      class="engine-icon engine-icon-img"
      @load="handleImgLoad"
      @error="handleImgError"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProbedIconUrl } from '@/composables/useProbedIconUrl';
import { getFaviconFromUrl, getFirstLetter } from '@/utils/getIcon';
import type { SearchEngine } from '@/types';

function isIconfontSymbol(icon: unknown): icon is string {
  return icon != null && typeof icon === 'string' && icon.trim().length > 0;
}

function getEngineIconUrl(engine: SearchEngine | null | undefined): string {
  if (!engine) return '';
  if (engine.iconUrl && typeof engine.iconUrl === 'string') return engine.iconUrl.trim();
  return getFaviconFromUrl(engine.url || '');
}

const props = withDefaults(
  defineProps<{
    engine: SearchEngine | null | undefined;
    /** 图片加载失败时由父组件传入，避免重复请求 */
    iconError?: boolean;
    /** 小号用于搜索栏触发区，中号用于选择器列表 */
    size?: 'small' | 'medium';
  }>(),
  { iconError: false, size: 'small' },
);

const emit = defineEmits<{ (e: 'error'): void }>();

const sizeClass = computed(() => `size-${props.size}`);

const iconfontId = computed(() => {
  const icon = props.engine?.icon;
  return icon && isIconfontSymbol(icon) ? icon.trim() : '';
});

const rawIconUrl = computed(() => {
  if (iconfontId.value || props.iconError) return '';
  return getEngineIconUrl(props.engine) || '';
});

const {
  iconUrl,
  showImg,
  iconError: probedIconError,
  handleImgLoad,
  handleImgError,
} = useProbedIconUrl(rawIconUrl, { onError: () => emit('error') });

const fallback = computed(() => getFirstLetter(props.engine?.name ?? ''));

const showFallbackLetter = computed(
  () => !(iconUrl.value && showImg.value && !probedIconError.value),
);
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
  position: relative;
}
.engine-icon-fallback-letter {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.82);
}
.size-medium.engine-icon {
  width: 28px;
  height: 28px;
}
.size-medium.engine-icon-fallback {
  font-size: 18px;
}
</style>

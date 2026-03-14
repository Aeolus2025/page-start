<template>
  <!-- 内联模式：紧贴搜索框下方，与搜索框同宽、同风格（图二） -->
  <Transition v-if="inline" name="slide-down">
    <div
      v-if="visible"
      class="engine-picker engine-picker-inline"
      @contextmenu.stop.prevent
    >
      <div class="picker-grid">
        <div
          v-for="eng in allEngines"
          :key="eng.id"
          class="picker-item"
          :class="{ 'is-current': eng.id === currentEngine?.id }"
          @click="select(eng)"
        >
          <svg v-if="getIconfontId(eng)" class="picker-icon-svg" :aria-label="eng.name">
            <use :href="`#${getIconfontId(eng)}`" />
          </svg>
          <img
            v-else-if="getIconUrl(eng)"
            :src="getIconUrl(eng)"
            :alt="eng.name"
            class="picker-icon-img"
            @error="onPickerIconError(eng)"
          />
          <span v-else class="picker-icon">{{ getIconFallback(eng) }}</span>
          <span class="picker-name">{{ eng.name }}</span>
        </div>
        <div class="picker-item picker-item-add" @click="showAddForm = true">
          <span class="picker-icon">➕</span>
          <span class="picker-name">添加自定义</span>
        </div>
      </div>
      <EnginePickerAddForm
        :visible="showAddForm"
        @close="showAddForm = false"
        @add="onAddEngine"
      />
    </div>
  </Transition>

  <!-- 浮层模式：底部滑出（保留兼容） -->
  <Teleport v-else to="body">
    <Transition name="slide-up">
      <div
        v-if="visible"
        class="engine-picker-overlay"
        @click.self="close"
      >
        <div class="engine-picker">
          <div class="picker-grid">
            <div
              v-for="eng in allEngines"
              :key="eng.id"
              class="picker-item"
              :class="{ 'is-current': eng.id === currentEngine?.id }"
              @click="select(eng)"
            >
              <svg v-if="getIconfontId(eng)" class="picker-icon-svg" :aria-label="eng.name">
                <use :href="`#${getIconfontId(eng)}`" />
              </svg>
              <img
                v-else-if="getIconUrl(eng)"
                :src="getIconUrl(eng)"
                :alt="eng.name"
                class="picker-icon-img"
                @error="onPickerIconError(eng)"
              />
              <span v-else class="picker-icon">{{ getIconFallback(eng) }}</span>
              <span class="picker-name">{{ eng.name }}</span>
            </div>
            <div class="picker-item picker-item-add" @click="showAddForm = true">
              <span class="picker-icon">➕</span>
              <span class="picker-name">添加自定义</span>
            </div>
          </div>
          <EnginePickerAddForm
            :visible="showAddForm"
            @close="showAddForm = false"
            @add="onAddEngine"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getEngineIconUrl, isIconfontSymbol } from '@/utils/engine';
import { DEFAULT_ENGINES } from '@/constants/engines';
import EnginePickerAddForm from './EnginePickerAddForm.vue';
import type { SearchEngine } from '@/types';

const STORAGE_KEY = 'page-start-custom-engines';

const pickerIconErrors = ref(new Set<string>());

function getIconfontId(eng: SearchEngine | null | undefined): string {
  if (!eng?.icon || !isIconfontSymbol(eng.icon)) return '';
  return eng.icon.trim();
}

function getIconUrl(eng: SearchEngine | null | undefined): string {
  if (!eng || getIconfontId(eng) || pickerIconErrors.value.has(eng.id)) return '';
  return getEngineIconUrl(eng) || '';
}

function getIconFallback(eng: SearchEngine | null | undefined): string {
  if (!eng?.name) return '🔍';
  return eng.name.slice(0, 1);
}

function onPickerIconError(eng: SearchEngine) {
  if (eng?.id) pickerIconErrors.value = new Set([...pickerIconErrors.value, eng.id]);
}

const loadCustomEngines = (): SearchEngine[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as { name: string; url: string }[];
    return Array.isArray(list) ? list.map((e, i) => ({ ...e, id: 'custom-' + i })) : [];
  } catch {
    return [];
  }
};

const saveCustomEngines = (list: SearchEngine[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map(({ name, url }) => ({ name, url }))));
};

const props = withDefaults(
  defineProps<{
    modelValue?: SearchEngine | null;
    visible?: boolean;
    inline?: boolean;
  }>(),
  { modelValue: null, visible: false, inline: false }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: SearchEngine | null): void;
  (e: 'update:visible', v: boolean): void;
  (e: 'after-select'): void;
}>();

const customEngines = ref(loadCustomEngines());
const allEngines = computed(() => [...DEFAULT_ENGINES, ...customEngines.value]);
const currentEngine = computed(() => props.modelValue);
const showAddForm = ref(false);

const close = () => {
  showAddForm.value = false;
  emit('update:visible', false);
};

const select = (eng: SearchEngine) => {
  if (eng.id && eng.id.startsWith('custom-')) {
    emit('update:modelValue', { id: eng.id, name: eng.name, url: eng.url, icon: eng.icon });
  } else {
    emit('update:modelValue', { ...eng });
  }
  close();
  emit('after-select');
};

function onAddEngine(payload: { name: string; url: string }) {
  const { name, url } = payload;
  const list = loadCustomEngines();
  list.push({ id: 'custom-' + list.length, name, url });
  saveCustomEngines(list);
  customEngines.value = loadCustomEngines();
  showAddForm.value = false;
}
</script>

<style scoped>
/* 与搜索框统一的毛玻璃风格 */
.engine-picker {
  min-width: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.18) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 24px;
  padding: 16px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* 内联模式：紧贴搜索框下方，同宽，小间距 */
.engine-picker-inline {
  width: 100%;
  min-width: 0;
  margin-top: 10px;
  overflow: hidden;
}

.slide-down-enter-active,
.slide-down-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 浮层模式（未使用 inline 时） */
.engine-picker-overlay {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0 16px max(24px, env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.25);
}

.engine-picker-overlay .engine-picker {
  width: 100%; max-width: 420px;
  border-radius: 24px 24px 0 0;
}

.slide-up-enter-active,
.slide-up-leave-active { transition: opacity 0.25s ease; }
.slide-up-enter-active .engine-picker,
.slide-up-leave-active .engine-picker {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to { opacity: 0; }
.slide-up-enter-from .engine-picker,
.slide-up-leave-to .engine-picker {
  transform: translateY(100%);
}
.slide-up-enter-to .engine-picker,
.slide-up-leave-from .engine-picker {
  transform: translateY(0);
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.picker-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.picker-item:hover { background: rgba(255, 255, 255, 0.35); transform: scale(1.02); }
.picker-item.is-current { background: rgba(255, 255, 255, 0.4); }

.picker-icon { font-size: 20px; margin-bottom: 4px; }
.picker-name { font-size: 13px; color: rgba(0, 0, 0, 0.9); }

.picker-item-add { border: 1px dashed rgba(0, 0, 0, 0.35); }

.picker-icon-svg {
  width: 28px;
  height: 28px;
  margin-bottom: 4px;
  flex-shrink: 0;
  fill: currentColor;
  color: rgba(0, 0, 0, 0.78);
}
.picker-icon-img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
  margin-bottom: 4px;
  filter: grayscale(100%) brightness(0.35) contrast(1.4);
}
.picker-icon { font-size: 20px; margin-bottom: 4px; }

</style>

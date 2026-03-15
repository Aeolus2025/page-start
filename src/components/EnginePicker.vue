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
            <i
              class="iconfont icon-top picker-item-remove"
              aria-label="删除"
              @click.stop="removeEngine(eng, $event)"
            />
            <EngineIcon
              :engine="eng"
              size="medium"
              :icon-error="pickerIconErrors.has(eng.id)"
              @error="onPickerIconError(eng)"
            />
            <span class="picker-name">{{ eng.name }}</span>
          </div>
          <div class="picker-item picker-item-restore" @click="restoreDefaultEngines" title="恢复默认搜索引擎">
            <i class="iconfont icon-huifu picker-icon" aria-hidden="true"></i>
            <span class="picker-name">恢复默认</span>
          </div>
          <div class="picker-item picker-item-add" @click="showAddForm = true">
            <i class="iconfont icon-jia picker-icon" aria-hidden="true"></i>
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
                <i
                  class="iconfont icon-top picker-item-remove"
                  aria-label="删除"
                  @click.stop="removeEngine(eng, $event)"
                />
                <EngineIcon
                  :engine="eng"
                  size="medium"
                  :icon-error="pickerIconErrors.has(eng.id)"
                  @error="onPickerIconError(eng)"
                />
                <span class="picker-name">{{ eng.name }}</span>
              </div>
              <div class="picker-item picker-item-restore" @click="restoreDefaultEngines" title="恢复默认搜索引擎">
                <i class="iconfont icon-huifu picker-icon" aria-hidden="true"></i>
                <span class="picker-name">恢复默认</span>
              </div>
              <div class="picker-item picker-item-add" @click="showAddForm = true">
                <i class="iconfont icon-jia picker-icon" aria-hidden="true"></i>
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
import { ref, computed, watch } from 'vue';
import { DEFAULT_ENGINES } from '@/constants/engines';
import { getItem, setItem } from '@/utils/storage';
import EngineIcon from './EngineIcon.vue';
import EnginePickerAddForm from './EnginePickerAddForm.vue';
import type { SearchEngine } from '@/types';

const STORAGE_KEY = 'page-start-custom-engines';
const HIDDEN_IDS_KEY = 'hiddenEngineIds';

function loadHiddenIds(): string[] {
  try {
    const raw = getItem(HIDDEN_IDS_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw as string);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveHiddenIds(ids: string[]) {
  setItem(HIDDEN_IDS_KEY, ids);
}

const pickerIconErrors = ref(new Set<string>());
const hiddenIds = ref<string[]>(loadHiddenIds());

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
const allEngines = computed(() => [
  ...DEFAULT_ENGINES.filter((e) => !hiddenIds.value.includes(e.id)),
  ...customEngines.value
]);
const currentEngine = computed(() => props.modelValue);
const showAddForm = ref(false);

watch(() => props.visible, (visible) => {
  if (visible) hiddenIds.value = loadHiddenIds();
});

watch(allEngines, (engs) => {
  if (engs.length === 0) showAddForm.value = false;
}, { deep: true });

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

function removeEngine(eng: SearchEngine, e: Event) {
  e.stopPropagation();
  if (eng.id.startsWith('custom-')) {
    const next = customEngines.value.filter((c) => c.id !== eng.id);
    saveCustomEngines(next);
    customEngines.value = loadCustomEngines();
  } else {
    hiddenIds.value = [...hiddenIds.value, eng.id];
    saveHiddenIds(hiddenIds.value);
  }
}

function restoreDefaultEngines() {
  hiddenIds.value = [];
  saveHiddenIds([]);
  saveCustomEngines([]);
  customEngines.value = [];
  const first = DEFAULT_ENGINES[0];
  if (first) {
    emit('update:modelValue', { ...first });
  }
}
</script>

<style scoped>
/* 与搜索框统一的毛玻璃风格；border-box 保证与搜索框等宽 */
.engine-picker {
  min-width: 0;
  box-sizing: border-box;
  background: linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.18) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 24px;
  padding: 16px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* 内联模式：紧贴搜索框下方，与搜索框等宽（同属 search-block max-width: 520px） */
.engine-picker-inline {
  width: 100%;
  max-width: 520px;
  min-width: 0;
  margin-top: 10px;
  overflow: hidden;
  box-sizing: border-box;
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
  min-height: 88px;
}

.picker-item {
  position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.picker-item-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  padding: 2px;
  transition: color 0.15s;
}
.picker-item-remove:hover {
  color: rgba(0, 0, 0, 0.85);
}

.picker-item:hover { background: rgba(255, 255, 255, 0.35); transform: scale(1.02); }
.picker-item.is-current { background: rgba(255, 255, 255, 0.4); }

.picker-icon { font-size: 20px; margin-bottom: 4px; }
.picker-item :deep(.engine-icon) { margin-bottom: 4px; }
.picker-name { font-size: 13px; color: rgba(0, 0, 0, 0.9); }

.picker-item-restore,
.picker-item-add { border: 1px dashed rgba(0, 0, 0, 0.35); }
.picker-item-restore .picker-icon,
.picker-item-add .picker-icon { margin-bottom: 0; }

</style>

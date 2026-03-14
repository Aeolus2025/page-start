<template>
  <!-- 内联模式：紧贴搜索框下方，与搜索框同宽、同风格（图二） -->
  <Transition v-if="inline" name="slide-down">
    <div
      v-if="visible"
      class="engine-picker engine-picker-inline"
      ref="pickerRef"
      @contextmenu.stop.prevent
    >
      <div class="picker-header">
        <span class="current-label">在 {{ currentEngine?.name }} 上搜索</span>
        <span class="search-hint">🔍</span>
      </div>
      <div class="picker-grid">
        <div
          v-for="eng in allEngines"
          :key="eng.id"
          class="picker-item"
          :class="{ 'is-current': eng.id === currentEngine?.id }"
          @click="select(eng)"
        >
          <span class="picker-icon">{{ eng.icon || '🔍' }}</span>
          <span class="picker-name">{{ eng.name }}</span>
        </div>
        <div class="picker-item picker-item-add" @click="showAddForm = true">
          <span class="picker-icon">➕</span>
          <span class="picker-name">添加自定义</span>
        </div>
      </div>
      <div v-if="showAddForm" class="add-form">
        <input v-model="customName" type="text" placeholder="名称" class="add-input" />
        <input v-model="customUrl" type="text" placeholder="搜索 URL，用 %s 表示关键词" class="add-input add-url" />
        <div class="add-actions">
          <button type="button" class="add-btn cancel" @click="cancelAdd">取消</button>
          <button type="button" class="add-btn confirm" @click="confirmAdd">添加</button>
        </div>
      </div>
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
        <div class="engine-picker" ref="pickerRef">
          <div class="picker-header">
            <span class="current-label">在 {{ currentEngine?.name }} 上搜索</span>
            <span class="search-hint">🔍</span>
          </div>
          <div class="picker-grid">
            <div
              v-for="eng in allEngines"
              :key="eng.id"
              class="picker-item"
              :class="{ 'is-current': eng.id === currentEngine?.id }"
              @click="select(eng)"
            >
              <span class="picker-icon">{{ eng.icon || '🔍' }}</span>
              <span class="picker-name">{{ eng.name }}</span>
            </div>
            <div class="picker-item picker-item-add" @click="showAddForm = true">
              <span class="picker-icon">➕</span>
              <span class="picker-name">添加自定义</span>
            </div>
          </div>
          <div v-if="showAddForm" class="add-form">
            <input v-model="customName" type="text" placeholder="名称" class="add-input" />
            <input v-model="customUrl" type="text" placeholder="搜索 URL，用 %s 表示关键词" class="add-input add-url" />
            <div class="add-actions">
              <button type="button" class="add-btn cancel" @click="cancelAdd">取消</button>
              <button type="button" class="add-btn confirm" @click="confirmAdd">添加</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';

const STORAGE_KEY = 'page-start-custom-engines';

const defaultEngines = [
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=%s', icon: '🐾' },
  { id: 'google', name: '谷歌', url: 'https://www.google.com/search?q=%s', icon: 'G' },
  { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q=%s', icon: 'B' }
];

const loadCustomEngines = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.map((e, i) => ({ ...e, id: 'custom-' + i })) : [];
  } catch {
    return [];
  }
};

const saveCustomEngines = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map(({ name, url }) => ({ name, url }))));
};

const props = defineProps({
  modelValue: { type: Object, default: null },
  visible: { type: Boolean, default: false },
  inline: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'update:visible', 'after-select']);

const customEngines = ref(loadCustomEngines());
const allEngines = computed(() => [...defaultEngines, ...customEngines.value]);
const currentEngine = computed(() => props.modelValue);
const pickerRef = ref(null);
const showAddForm = ref(false);
const customName = ref('');
const customUrl = ref('');

const close = () => {
  showAddForm.value = false;
  emit('update:visible', false);
};

const select = (eng) => {
  if (eng.id && eng.id.startsWith('custom-')) {
    emit('update:modelValue', { id: eng.id, name: eng.name, url: eng.url, icon: eng.icon });
  } else {
    emit('update:modelValue', { ...eng });
  }
  close();
  emit('after-select');
};

const cancelAdd = () => {
  showAddForm.value = false;
  customName.value = '';
  customUrl.value = '';
};

const confirmAdd = () => {
  const name = customName.value.trim();
  const url = (customUrl.value.trim() || '').replace(/\{query\}/g, '%s');
  if (!name || !url || !url.includes('%s')) return;
  const list = loadCustomEngines();
  list.push({ name, url });
  saveCustomEngines(list);
  customEngines.value = loadCustomEngines();
  cancelAdd();
};
</script>

<style scoped>
/* 与搜索框统一的毛玻璃风格 */
.engine-picker {
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
  margin-top: 10px;
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

.picker-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.75);
  font-size: 14px;
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
.picker-name { font-size: 13px; color: rgba(0, 0, 0, 0.85); }

.picker-item-add { border: 1px dashed rgba(0, 0, 0, 0.3); }

.add-form { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0, 0, 0, 0.08); }
.add-input { width: 100%; padding: 8px 12px; margin-bottom: 8px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.15); font-size: 14px; }
.add-url { font-family: monospace; }
.add-actions { display: flex; gap: 8px; justify-content: flex-end; }
.add-btn { padding: 6px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; }
.add-btn.cancel { background: rgba(0,0,0,0.08); }
.add-btn.confirm { background: rgba(0,0,0,0.2); color: #fff; }
</style>

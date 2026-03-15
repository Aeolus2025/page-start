<template>
  <div ref="wrapRef" class="shortcut-grid-wrap" :style="gridWrapStyle">
    <div class="grid" :class="{ 'grid-empty': shortcuts.items.length === 0 }">
      <a
        v-for="item in shortcuts.items"
        :key="item.id"
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
            @click.prevent.stop="openEdit(item)"
          >
            <i class="iconfont icon-xiugai" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="card-remove"
            aria-label="删除"
            title="删除"
            @click.prevent.stop="removeItem(item.id)"
          >
            <i class="iconfont icon-top" aria-hidden="true"></i>
          </button>
        </div>
        <div v-if="isIconUrl(item.icon) && !iconLoadErrorIds.has(item.id)" class="card-icon-wrap">
          <img
            class="card-icon-img"
            :src="item.icon"
            :alt="item.name"
            loading="lazy"
            @error="onIconError(item.id)"
          />
        </div>
        <div v-else-if="isIconUrl(item.icon) && iconLoadErrorIds.has(item.id)" class="card-icon-wrap card-icon-letter-wrap">
          <span class="card-icon-letter">{{ getFirstLetter(item.name) }}</span>
        </div>
        <div v-else class="icon">{{ item.icon || '🔗' }}</div>
        <p>{{ item.name }}</p>
      </a>
      <button type="button" class="card add-card" aria-label="添加快捷方式" @click="openAdd">
        <i class="iconfont icon-jia" aria-hidden="true"></i>
      </button>
    </div>

    <Transition name="modal-fade">
      <div v-if="addVisible" class="add-backdrop" @click.self="closeAdd">
        <div class="add-modal" @mousedown.stop>
          <h3 class="add-title">{{ editingId ? '修改快捷方式' : '添加快捷方式' }}</h3>
          <form class="add-form" @submit.prevent="submitForm">
            <div class="add-field">
              <label for="shortcut-name">名称</label>
              <input
                id="shortcut-name"
                v-model="form.name"
                type="text"
                placeholder="如：GitHub"
                required
                maxlength="32"
              />
            </div>
            <div class="add-field">
              <label for="shortcut-url">链接</label>
              <input
                id="shortcut-url"
                v-model="form.url"
                type="url"
                placeholder="https://..."
                required
              />
            </div>
            <div class="add-field">
              <label>图标（可选，不上传则使用链接默认图标）</label>
              <div class="add-icon-upload">
                <input
                  id="shortcut-icon-file"
                  type="file"
                  accept="image/*"
                  class="add-icon-input"
                  @change="onIconFileChange"
                />
                <label for="shortcut-icon-file" class="add-icon-label">
                  <img v-if="form.icon" :src="form.icon" class="add-icon-preview" alt="" />
                  <span v-else class="add-icon-placeholder">上传图标</span>
                </label>
                <button
                  v-if="form.icon"
                  type="button"
                  class="add-icon-clear"
                  @click="clearIconUpload"
                >
                  清除
                </button>
              </div>
            </div>
            <p v-if="addError" class="add-error">{{ addError }}</p>
            <div class="add-actions">
              <button type="button" class="btn-cancel" @click="closeAdd">取消</button>
              <button type="submit" class="btn-submit">{{ editingId ? '保存' : '添加' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue';
import { useShortcutsStore } from '@/store/shortcuts';
import { getShortcutFaviconUrl } from '@/utils/engine';

const CARD_WIDTH = 88;
const GAP = 20;

const shortcuts = useShortcutsStore();
const wrapRef = ref<HTMLElement | null>(null);
const wrapWidth = ref(520);
const addVisible = ref(false);
const editingId = ref<string | null>(null);
const addError = ref('');
const form = reactive({ name: '', url: '', icon: '' });
const iconLoadErrorIds = ref(new Set<string>());

function isIconUrl(icon: string): boolean {
  return Boolean(icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:')));
}

function getFirstLetter(name: string): string {
  const s = (name || '').trim();
  return s ? s.charAt(0).toUpperCase() : '?';
}

function onIconError(itemId: string) {
  iconLoadErrorIds.value = new Set(iconLoadErrorIds.value).add(itemId);
}

const columnsPerRow = computed(() =>
  Math.max(1, Math.floor((wrapWidth.value + GAP) / (CARD_WIDTH + GAP)))
);

const gridWrapStyle = computed(() => ({
  '--grid-cols': String(columnsPerRow.value)
}));

function openAdd() {
  editingId.value = null;
  addError.value = '';
  form.name = '';
  form.url = '';
  form.icon = '';
  addVisible.value = true;
}

function openEdit(item: { id: string; name: string; url: string; icon: string }) {
  editingId.value = item.id;
  addError.value = '';
  form.name = item.name;
  form.url = item.url;
  form.icon = isIconUrl(item.icon) ? item.icon : '';
  addVisible.value = true;
}

function onIconFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    form.icon = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function clearIconUpload() {
  form.icon = '';
}

function closeAdd() {
  addVisible.value = false;
  editingId.value = null;
  addError.value = '';
}

function removeItem(id: string) {
  shortcuts.remove(id);
}

function submitForm() {
  addError.value = '';
  const name = form.name.trim();
  const url = form.url.trim();
  if (!name || !url) {
    addError.value = '请填写名称和链接';
    return;
  }
  let href = url;
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  const icon = form.icon.trim() || getShortcutFaviconUrl(href);
  const iconVal = icon || '🔗';
  try {
    if (editingId.value) {
      shortcuts.update(editingId.value, { name, url: href, icon: iconVal });
    } else {
      shortcuts.add({ name, url: href, icon: iconVal });
    }
    closeAdd();
  } catch (e) {
    addError.value = editingId.value ? '修改失败，请重试' : '添加失败，请重试';
  }
}

watch(addVisible, (v) => {
  if (v) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
});

let resizeObs: ResizeObserver | null = null;
onMounted(() => {
  if (!wrapRef.value) return;
  wrapWidth.value = wrapRef.value.getBoundingClientRect().width || 520;
  resizeObs = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect.width;
    if (w != null && w > 0) wrapWidth.value = w;
  });
  resizeObs.observe(wrapRef.value);
});
onUnmounted(() => {
  if (wrapRef.value && resizeObs) resizeObs.unobserve(wrapRef.value);
  resizeObs = null;
});
</script>

<style scoped>
.shortcut-grid-wrap {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols, 4), 88px);
  gap: 20px;
  margin: 0;
  width: fit-content;
}
.grid-empty {
  /* 空时仅一个添加按钮，保持居中 */
  justify-items: center;
}
.card {
  width: 88px;
  min-width: 88px;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: 0.25s;
  text-decoration: none;
  box-sizing: border-box;
  position: relative;
}
button.card {
  font: inherit;
  padding: 0;
}
.card-link:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}
.add-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
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
  background: rgba(255, 255, 255, 0.18);
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
  color: rgba(255, 255, 255, 0.95);
  line-height: 1;
}
.card-icon-letter {
  user-select: none;
}
.add-card .iconfont {
  font-size: 36px;
  color: inherit;
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
.add-card {
  border-style: dashed;
}

/* Add modal */
.add-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.add-modal {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.add-title {
  margin: 0 0 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}
.add-form label {
  display: block;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 6px;
}
.add-field {
  margin-bottom: 16px;
}
.add-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
}
.add-field input[type="text"]:focus,
.add-field input[type="url"]:focus {
  outline: none;
  border-color: rgba(0, 0, 0, 0.4);
}
.add-icon-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}
.add-icon-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}
.add-icon-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.add-icon-label:hover {
  border-color: rgba(0, 0, 0, 0.35);
  background: rgba(0, 0, 0, 0.04);
}
.add-icon-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.add-icon-placeholder {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}
.add-icon-clear {
  padding: 6px 12px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.08);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.add-icon-clear:hover {
  background: rgba(0, 0, 0, 0.12);
}
.add-error {
  margin: 0 0 12px;
  font-size: 13px;
  color: #c62828;
}
.add-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
.btn-cancel,
.btn-submit {
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.btn-cancel {
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.8);
}
.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.12);
}
.btn-submit {
  background: rgba(0, 0, 0, 0.75);
  color: white;
}
.btn-submit:hover {
  background: rgba(0, 0, 0, 0.85);
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .add-modal,
.modal-fade-leave-active .add-modal {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from .add-modal,
.modal-fade-leave-to .add-modal {
  transform: scale(0.96);
}
</style>

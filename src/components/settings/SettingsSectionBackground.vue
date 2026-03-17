<template>
  <section class="settings-section">
    <h3 class="section-title">背景</h3>
    <div class="bg-preview-wrap">
      <div class="bg-preview" :style="previewStyle"></div>
    </div>
    <p v-if="uploadError" class="bg-error">{{ uploadError }}</p>
    <div class="bg-actions">
      <label class="btn btn-primary">
        <input type="file" :accept="acceptTypes" class="file-input" @change="onFileSelect" />
        上传背景图片
      </label>
      <button type="button" class="btn btn-outline" :disabled="!config.hasCustomBackground" @click="removeBg">
        恢复默认背景
      </button>
    </div>
    <p class="bg-hint">支持 JPG、PNG、WebP、GIF，单张不超过 10MB，建议尺寸不超过 4096×4096</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useConfigStore } from '@/store/settings';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 4096;

const config = useConfigStore();
const uploadError = ref('');

const acceptTypes = computed(() => ALLOWED_TYPES.join(','));

const previewStyle = computed(() => ({
  backgroundImage: `url(${config.backgroundUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}));

function setError(msg: string) {
  uploadError.value = msg;
}

function clearError() {
  uploadError.value = '';
}

async function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  clearError();
  if (!file) return;
  if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    setError('仅支持 JPG、PNG、WebP、GIF 格式');
    return;
  }
  if (file.size > MAX_SIZE_BYTES) {
    setError('图片不超过 10MB');
    return;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      setError(`图片单边不超过 ${MAX_DIMENSION} 像素`);
      return;
    }
  } catch {
    setError('无法读取图片尺寸');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    config.setBackgroundImage(reader.result as string);
    clearError();
  };
  reader.readAsDataURL(file);
}

function removeBg() {
  config.removeBackgroundImage();
  clearError();
}
</script>

<style scoped>
.bg-preview-wrap {
  border-radius: 12px;
  overflow: hidden;
  background: var(--glass-divider);
  margin-bottom: 12px;
}
.bg-preview { height: 120px; width: 100%; }
.bg-error {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--color-danger);
}
.bg-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.bg-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--glass-text-muted);
}
.file-input { position: absolute; width: 0; height: 0; opacity: 0; }
.btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background 0.2s, opacity 0.2s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary {
  background: var(--glass-text);
  color: var(--color-text-inverse);
  position: relative;
}
.btn-primary:hover:not(:disabled) { background: var(--glass-icon); }
.btn-outline {
  background: transparent;
  color: var(--glass-text);
  border: 1px solid var(--glass-input-border);
}
.btn-outline:hover:not(:disabled) { background: var(--glass-divider); }
</style>

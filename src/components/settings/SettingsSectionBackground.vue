<template>
  <section class="settings-section">
    <h3 class="section-title">背景图</h3>
    <div class="bg-preview-wrap">
      <div class="bg-preview" :style="previewStyle"></div>
    </div>
    <div class="bg-actions">
      <label class="btn btn-primary">
        <input type="file" accept="image/*" class="file-input" @change="onFileSelect" />
        上传图片
      </label>
      <button type="button" class="btn btn-outline" :disabled="!config.hasCustomBackground" @click="removeBg">
        删除自定义
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConfigStore } from '@/store/config';

const config = useConfigStore();

const previewStyle = computed(() => ({
  backgroundImage: `url(${config.backgroundUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}));

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => config.setBackgroundImage(reader.result as string);
  reader.readAsDataURL(file);
  input.value = '';
}

function removeBg() {
  config.removeBackgroundImage();
}
</script>

<style scoped>
.bg-preview-wrap {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
}
.bg-preview { height: 120px; width: 100%; }
.bg-actions { display: flex; gap: 10px; flex-wrap: wrap; }
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
  background: rgba(0, 0, 0, 0.75);
  color: white;
  position: relative;
}
.btn-primary:hover:not(:disabled) { background: rgba(0, 0, 0, 0.85); }
.btn-outline {
  background: transparent;
  color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.btn-outline:hover:not(:disabled) { background: rgba(0, 0, 0, 0.06); }
</style>

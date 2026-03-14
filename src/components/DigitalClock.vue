<template>
  <div 
    class="clock"
    @contextmenu.stop.prevent
    @click="handleClick"
  >
    {{ currentTime }}
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['blur-search']);

const currentTime = ref('');
const updateTime = () => {
  const now = new Date();
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

let timer = setInterval(updateTime, 1000);

// 左键点击时钟（如失焦搜索等）
const handleClick = () => {
  emit('blur-search');
};

onMounted(updateTime);
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.clock {
  /* 减小字号，使其不会喧宾夺主 */
  font-size: 4rem; 
  /* 稍微加粗一点点，增强存在感 */
  font-weight: 300; 
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  /* 使用更加现代的字体栈 */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  letter-spacing: -1px;
  /* 确保垂直间距不被多余的 margin 影响 */
  margin: 0;
  padding: 0;
  line-height: 1;
}
</style>
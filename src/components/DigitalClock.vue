<template>
  <div
    class="clock"
    :class="[sizeClass, weightClass, styleClass]"
    @contextmenu.stop.prevent
    @click="handleClick"
  >
    {{ currentTime }}
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config.js';

const emit = defineEmits(['blur-search']);

const config = useConfigStore();
const { timeFormat24, timeShowSeconds, timeFontSize, timeFontWeight, timeFontStyle } = storeToRefs(config);

const currentTime = ref('');

const updateTime = () => {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  if (!timeFormat24.value) {
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    if (timeShowSeconds.value) {
      currentTime.value = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${period}`;
    } else {
      currentTime.value = `${h}:${String(m).padStart(2, '0')} ${period}`;
    }
  } else {
    if (timeShowSeconds.value) {
      currentTime.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else {
      currentTime.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }
};

const sizeClass = computed(() => `size-${timeFontSize.value}`);
const weightClass = computed(() => `weight-${timeFontWeight.value}`);
const styleClass = computed(() => `style-${timeFontStyle.value}`);

const intervalMs = computed(() => (timeShowSeconds.value ? 1000 : 60000));
let timer = null;

function startTimer() {
  if (timer) clearInterval(timer);
  updateTime();
  timer = setInterval(updateTime, intervalMs.value);
}

watch([timeFormat24, timeShowSeconds], () => {
  startTimer();
});

// 左键点击时钟（如失焦搜索等）
const handleClick = () => {
  emit('blur-search');
};

onMounted(startTimer);
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.clock {
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  letter-spacing: -1px;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.size-small {
  font-size: 2.5rem;
}

.size-medium {
  font-size: 4rem;
}

.size-large {
  font-size: 5.5rem;
}

.weight-normal {
  font-weight: 400;
}

.weight-bold {
  font-weight: 700;
}

.style-normal {
  font-style: normal;
}

.style-italic {
  font-style: italic;
}

.style-script {
  font-style: normal;
  font-family: 'Dancing Script', 'Brush Script MT', cursive;
}
</style>

<template>
  <div class="search-wrapper" :class="{ 'focused': isFocused }">
    <select v-model="currentEngine" class="engine-select">
      <option v-for="eng in engines" :key="eng.name" :value="eng">{{ eng.name }}</option>
    </select>
    <input
      ref="inputRef" v-model="query" type="text"
      placeholder="输入以搜索..."
      @focus="handleFocus" @blur="handleBlur" @keyup.enter="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
const emit = defineEmits(['focus-change']);
const query = ref('');
const isFocused = ref(false);
const inputRef = ref(null);
const engines = [
  { name: '百度', url: 'https://www.baidu.com/s?wd=' },
  { name: '谷歌', url: 'https://www.google.com/search?q=' },
  { name: '必应', url: 'https://www.bing.com/search?q=' }
];
const currentEngine = ref(engines[0]);

onMounted(() => inputRef.value?.focus());
const handleFocus = () => { isFocused.value = true; emit('focus-change', true); };
const handleBlur = () => { isFocused.value = false; emit('focus-change', false); };
const handleSearch = () => {
  if (query.value.trim()) window.location.href = currentEngine.value.url + encodeURIComponent(query.value);
};
</script>

<style scoped>
.search-wrapper {
  display: flex; align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 24px; border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s ease; width: 450px;
}
.search-wrapper.focused { background: rgba(255, 255, 255, 0.3); width: 500px; }
input { 
  border: none; outline: none; background: transparent;
  padding: 5px 15px; font-size: 16px; width: 100%; color: white; text-align: center;
}
.engine-select { border: none; background: transparent; color: white; cursor: pointer; outline: none; }
</style>
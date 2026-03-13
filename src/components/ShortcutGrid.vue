<template>
  <div class="grid">
    <div v-for="item in shortcuts" :key="item.name" class="card">
      <div class="icon">{{ item.icon }}</div>
      <p>{{ item.name }}</p>
    </div>
    <div class="card add-card">+</div>
  </div>
</template>

<script setup>
const shortcuts = [
  { name: '云音乐', icon: '🎵' }, { name: 'bilibili', icon: '📺' },
  { name: '壁纸', icon: '🎨' }, { name: '深色主题', icon: '☀️' }
];
</script>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; margin-top: 40px; }
.card { 
  width: 100px; height: 100px; background: rgba(255, 255, 255, 0.1);
  border-radius: 20px; display: flex; flex-direction: column;
  justify-content: center; align-items: center; color: white;
  backdrop-filter: blur(10px); cursor: pointer; transition: 0.3s;
}
.card:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.05); }
</style>
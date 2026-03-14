<template>
  <div class="grid">
    <div v-for="item in shortcuts" :key="item.name" class="card">
      <div class="icon">{{ item.icon }}</div>
      <p>{{ item.name }}</p>
    </div>
    <div class="card add-card">+</div>
  </div>
</template>

<script setup lang="ts">
const shortcuts: { name: string; icon: string }[] = [
  { name: '云音乐', icon: '🎵' }, { name: 'bilibili', icon: '📺' },
  { name: '壁纸', icon: '🎨' }, { name: '深色主题', icon: '☀️' }
];
</script>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-top: 0; }
.card { 
  width: 100%; max-width: 88px; aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px; display: flex; flex-direction: column;
  justify-content: center; align-items: center; color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px); cursor: pointer; transition: 0.25s;
}
.card:hover { background: rgba(255, 255, 255, 0.25); transform: scale(1.05); }
.add-card { border-style: dashed; }
</style>
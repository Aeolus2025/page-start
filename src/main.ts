import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@/assets/js/iconfont.js';
import '@/assets/css/iconfont.css';
import './style.css';
import App from './App.vue';
import { getItem } from '@/utils/storage';
import { StorageKey } from '@/types';

const theme = getItem(StorageKey.Theme);
const dataTheme = theme && ['light', 'dark', 'system'].includes(theme) ? theme : 'light';
document.documentElement.setAttribute('data-theme', dataTheme);

const app = createApp(App);
app.use(createPinia());
app.mount('#app');

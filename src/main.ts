import { createHead } from '@unhead/vue/client';
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

const app = createApp(App);
const head = createHead();
app.use(head);
app.mount('#app');

import App from './App.vue'
import store from './store';
import router from './router';
import { createApp } from 'vue'

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');

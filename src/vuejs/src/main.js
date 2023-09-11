import App from './App.vue'
import store from './store';
import router from './router';
import { createApp } from 'vue'

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Titre par défaut';
    next();
});

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');
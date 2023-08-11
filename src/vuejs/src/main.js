import App from './App.vue'
import router from './router';
import { createApp } from 'vue'

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Titre par défaut';
    next();
});

createApp(App).use(router).mount('#app')
import App from './App.vue'
import { createApp } from 'vue'
import appRoutes from './router'
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: appRoutes
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Titre par défaut';
    next();
});

createApp(App).use(router).mount('#app')

export default router;
import { createRouter, createWebHistory } from 'vue-router'
import authLogin from './components/authLogin.vue';
import deLog from './components/deLog.vue';
import welcomePage from './components/welcomePage.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: authLogin,
        meta: {
            title: 'Se connecter'
        }
    },
    {
        path: '/return',
        name: 'Logout',
        component: deLog,
        meta: {
            title: 'Se deconnecter'
        }
    },
    {
        path: '/',
        name: 'Home',
        component: welcomePage,
        meta: {
            title: 'P O N G'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Titre par défaut';
    next();
});

export default router

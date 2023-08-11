import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: App,
        meta: {
            title: 'P O N G'
        }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes // raccourci pour `routes: routes`
});

export default router;

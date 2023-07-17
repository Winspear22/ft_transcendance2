import { createRouter, createWebHistory } from 'vue-router'
import authLogin from './components/authLogin.vue';

const routes = [
	{
		path: '/login',
		name: 'Login',
		component: authLogin,
		meta: {
			title: 'Se connecter'
		}
	},
	// ajoutez d'autres routes ici
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to, from, next) => {
	document.title = to.meta.title || 'P O N G';
	next();
});

export default router


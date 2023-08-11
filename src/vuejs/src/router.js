import { createRouter, createWebHistory } from 'vue-router';
import store from './store'; // Assurez-vous d'importer votre store ici
import Home from './views/homePage.vue';
import Login from './views/loginPage.vue';
import Setting from './views/settingPage.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: {
      title: 'L O G I N',
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: 'H O M E',
      requiresAuth: true  // indiquer que cette route nécessite une authentification
    }
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting,
    meta: {
      title: 'S E T T I N G',
      requiresAuth: true  // Idem
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

// La logique de gardien de navigation
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated; 

  if (requiresAuth && !isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;

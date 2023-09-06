import { createRouter, createWebHistory } from 'vue-router';
import store from './store';
import Home from './home/HomePage.vue';
import Game from './game/GamePage.vue';
import Chat from './chat/ChatPage.vue';
import Login from './login/LoginPage.vue';
import Setting from './setting/SettingPage.vue';
import ProfileModification from './setting/ProfileModification.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Login',
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Home',
      requiresAuth: true
    }
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    meta: {
      title: 'Game',
      requiresAuth: true
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: 'Chat',
      requiresAuth: true
    }
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting,
    meta: {
      title: 'Setting',
      requiresAuth: true
    },
  },
  {
    path: '/setting/ProfileModification',
    name: 'ProfileModification',
    component: ProfileModification,
    meta: {
      title: 'Modify Profile',
      requiresAuth: true
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Default Title';
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    next('/');
  } else if (to.path === '/' && isAuthenticated) {
    next('/home');
  } else {
    next();
  }
});

export default router;
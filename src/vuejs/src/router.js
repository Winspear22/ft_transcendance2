import { createRouter, createWebHistory } from 'vue-router';
import store from './store';
import Home from './home/homePage.vue';
import Game from './game/gamePage.vue';
import Chat from './chat/chatPage.vue';
import Login from './login/loginPage.vue';
import Setting from './setting/settingPage.vue';
import ProfileModification from './setting/ProfileModification.vue';
import FriendProfile from './home/profileFriend.vue'; 
import OnlineProfile from './home/profileOnline.vue'; 

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
  {
    path: '/friend-profile/:username',
    name: 'FriendProfile',
    component: FriendProfile,
    meta: {
        title: 'Friend Profile',
        requiresAuth: true
    },
    props: route => ({ username: route.params.username })
  },
  {
    path: '/online-profile/:username',
    name: 'OnlineProfile',
    component: OnlineProfile,
    meta: {
        title: 'Online User Profile',
        requiresAuth: true
    },
    props: route => ({ username: route.params.username })
  }
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

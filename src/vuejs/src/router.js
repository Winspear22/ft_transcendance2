import { createRouter, createWebHistory } from 'vue-router';
//import store from './store';
import Home from './home/homePage.vue';
import Game from './game/gamePage.vue';
import Chat from './chat/chatPage.vue';
import Login from './login/loginPage.vue';
import Setting from './setting/settingPage.vue';

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
     // requiresAuth: true  // indiquer que cette route nécessite une authentification
    }
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
    meta: {
      title: 'G A M E',
     // requiresAuth: true  // indiquer que cette route nécessite une authentification
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: 'C H A T',
     // requiresAuth: true  // indiquer que cette route nécessite une authentification
    }
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting,
    meta: {
      title: 'S E T T I N G',
   //   requiresAuth: true  // Idem
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

// La logique de gardien de navigation
//router.beforeEach((to, from, next) => {
  //const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  //const isAuthenticated = store.getters.isAuthenticated;
  //console.log("Exige une authentification ?", requiresAuth);
  //console.log("Est authentifié ?", isAuthenticated);

  //if (requiresAuth && !isAuthenticated) {
    //console.log("Redirection vers la page de login");
    //next('/');
  //} else {
    //next();
  //}
//});

export default router;
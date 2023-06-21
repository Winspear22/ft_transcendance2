import Vue from 'vue';
import VueRouter from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import AboutSection from './components/AboutSection.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/aboutsection', component: AboutSection }
];

const router = new VueRouter({
  routes
});

export default router;
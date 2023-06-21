<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <AboutSection msg="Welcome to your AboutSection page"/>
    <router-view></router-view>
  </div>
</template>
<!--Lorsque je retire la ligne 4 12 et 19, la page About
section ne s'affiche que sur la route AboutSection, alors
que lorsque je les laisse, elle s'affiche partout,
de meme pour HelloWorld, etrange..-->
<script>
import HelloWorld from './components/HelloWorld.vue'
import AboutSection from './components/AboutSection.vue';
import router from './router';

export default {
  name: 'App',
  components: {
    HelloWorld,
    AboutSection
  },
  router
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

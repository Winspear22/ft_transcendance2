<template>
  <div id="app" class="container">
    <h1 class="centered-title">B i e n v e n u e</h1>
    <authLogin @login-success="handleLoginSuccess" v-if="!isLoggedIn" class="centered-login"></authLogin>
    <p v-if="isLoggedIn">Vous êtes connecté</p>
  </div>
</template>






<script>

import { ref } from 'vue';
import authLogin from './components/authLogin.vue';

export default {
  components: {
    authLogin
  },
  setup() {
    const isLoggedIn = ref(false);

    function handleLoginSuccess() {
      isLoggedIn.value = true;
    }

    return { isLoggedIn, handleLoginSuccess }
  }
};
</script>



<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.centered-title {
  text-align: center;
}

.centered-login {
  margin: auto;
}
</style>

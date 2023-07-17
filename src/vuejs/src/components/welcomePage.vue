<template>
  <div id="app" class="container">
    <h1 class="centered-title">
	<span class="part-one">P O</span>
	<span class="part-two"> N G</span>
	</h1>
    <authLogin @login-success="handleLoginSuccess" v-if="!isLoggedIn" class="centered-login"></authLogin>
    <div v-if="isLoggedIn">
      <deLog @logout-success="handleLogoutSuccess"></deLog>
      <p>Vous êtes connecté</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import authLogin from './authLogin.vue';
import deLog from './deLog.vue';

export default {
  components: {
    authLogin,
    deLog
  },
  setup() {
    const isLoggedIn = ref(false);

    function handleLoginSuccess() {
      isLoggedIn.value = true;
    }

    function handleLogoutSuccess() {
      isLoggedIn.value = false;
    }

    return { isLoggedIn, handleLoginSuccess, handleLogoutSuccess };
  }
};
</script>

<style>

body {
  background: linear-gradient(to right, #BA55D3 50%, #7B68EE 50%);
}
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

.part-one {
  color: #7B68EE;
}

.part-two {
  color: #BA55D3;
}

.centered-login {
  margin: auto;
}
</style>


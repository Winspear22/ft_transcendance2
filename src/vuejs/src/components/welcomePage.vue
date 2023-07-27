<template>
  <div id="app" class="container">
    <h1 class="centered-title">
      <span class="part-one">P O</span>
      <span class="part-two"> N G</span>
    </h1>
    <authLogin @login-success="handleLoginSuccess" v-if="!isLoggedIn" class="centered-login"></authLogin>
    <div v-else>
      <deLog @logout-success="handleLogoutSuccess"></deLog>
      <p>Vous êtes connecté</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import authLogin from './authLogin.vue';
import deLog from './deLog.vue';
import axios from 'axios';

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

    onMounted(async () => {
      try {
        const response = await axios.get('http://localhost:3000/check-auth', { withCredentials: true });
        if (response.data.success) {
          isLoggedIn.value = true;
        }
      } catch (error) {
        isLoggedIn.value = false;
      }
    });

    return { isLoggedIn, handleLoginSuccess, handleLogoutSuccess };
  }
};
</script>
<style>

body {
  background: linear-gradient(to right, #2459d5 50%, #2fe8ee 50%);
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
  color: #2fe8ee;
}

.part-two {
  color: #2459d5;
}

.centered-login {
  margin: auto;
}
</style>


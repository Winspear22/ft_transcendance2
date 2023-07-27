<template>
  <div>
    <!-- Si l'utilisateur est connecté -->
    <div v-if="isLoggedIn">
      <displayUser v-if="userInfo" :userInfo="userInfo" />
      <deLog :token="cookies" @logout-success="handleLogout"></deLog>
    </div>

    <!-- Si l'utilisateur n'est pas connecté -->
    <div v-else>
      <authLogin @login-success="handleLogin"></authLogin>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';  // Ajoutez onUnmounted
import authLogin from './authLogin.vue';
import deLog from './deLog.vue';
import displayUser from './displayUser.vue';
import axios from 'axios';

export default {
  components: {
      authLogin,
      deLog,
      displayUser
  },
  setup() {
      const isLoggedIn = ref(false);
      const userInfo = ref(null);
      const cookies = ref(null);
      let intervalId;

      async function checkUserStatus() {
          try {
              const response = await axios.get('http://localhost:3000/check-auth', { withCredentials: true });
              if (response.data.success) {
                  isLoggedIn.value = true;
                  userInfo.value = response.data.infoUser;
                  cookies.value = response.data.cookie;
                  console.log(userInfo.value);
              } else {
                  isLoggedIn.value = false;
              }
          } catch (error) {
              isLoggedIn.value = false;
          }
      }

      onMounted(() => {
          checkUserStatus();  // Vérifiez le statut de l'utilisateur une fois au montage

          intervalId = setInterval(checkUserStatus, 5000);  // Vérifiez le statut de l'utilisateur toutes les 5 secondes
      });

      onUnmounted(() => {
          clearInterval(intervalId);  // Nettoyez l'intervalle lorsque le composant est démonté
      });

      function handleLogin() {
          isLoggedIn.value = true;
      }

      function handleLogout() {
          isLoggedIn.value = false;
      }

      return { isLoggedIn, handleLogin, handleLogout, userInfo, cookies };
  }
};
</script>

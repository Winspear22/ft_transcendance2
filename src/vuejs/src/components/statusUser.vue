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
  import { ref, onMounted, onUnmounted } from 'vue';
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
            console.log(response.data.infoUser.user_status);
              if (response.data.infoUser.user_status == "Online") {
                  isLoggedIn.value = true;
                  userInfo.value = response.data.infoUser;
                  cookies.value = response.data.cookie; // Verifier si j'ai vraiment besoin du cookie.. Probable fuite de secu 
              } else {
                  isLoggedIn.value = false;
              }
          } catch (error) {
              isLoggedIn.value = false;
          }
      }
  
      onMounted(() => {
          checkUserStatus();
  
          intervalId = setInterval(checkUserStatus, 5000);
      });
  
      onUnmounted(() => {
          clearInterval(intervalId);
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
  
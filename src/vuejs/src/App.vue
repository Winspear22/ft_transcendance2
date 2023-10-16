<template>
    <div id="app">
      <div class="content-container">
        <DisplayPong />
        <nav>
          <router-link to="/" class="nav-link login-link">Login</router-link>
          <span class="separator">|</span>
          <router-link to="/setting" class="nav-link setting-link">Setting</router-link>
          <span class="separator">|</span>
          <router-link to="/home" class="nav-link home-link">Home</router-link>
          <span class="separator">|</span>
          <router-link to="/chat" class="nav-link chat-link">Chat</router-link>
          <span class="separator">|</span>
          <router-link to="/dm" class="nav-link dm-link">Dm</router-link>
          <span class="separator">|</span>
          <router-link to="/game" class="nav-link game-link">Game</router-link>
        </nav>
        <router-view/>
    </div>
  </div>
  </template>
  
  <script>
import store from '@/store';
import axios from 'axios';
import { onMounted, onBeforeUnmount } from 'vue';
import DisplayPong from './displayPong'
  
  export default {
    components: {
      DisplayPong
    },
    setup() {

      let inactivityTimer;
      const MAX_INACTIVITY_TIME = 600000; // 10 minutes en millisecondes

      function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(logoutUser, MAX_INACTIVITY_TIME);
      }
      async function logoutUser() {
        try {
          const response = await axios.post('http://' + process.env.VUE_APP_HOSTNAME + ':3000/auth/Logout', {}, { withCredentials: true });
          if (response.status === 200) {
            store.dispatch('authenticate', false);
            store.dispatch('activateTwoFa', response.data.partialUser.isTwoFactorAuthenticationEnabled);
            store.getters.socketDm.disconnect();
            store.getters.socketChat.disconnect();
            store.getters.gameSocket.disconnect();
            window.location.reload();
          }
        } catch (error) {
          console.error("Erreur lors de la déconnexion :", error);
        }
      }

      onMounted(() => {
        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('keydown', resetInactivityTimer);
        resetInactivityTimer(); // Démarre le compteur d'inactivité initial
        
      });

      onBeforeUnmount(() => {
        document.removeEventListener('mousemove', resetInactivityTimer);
        document.removeEventListener('keydown', resetInactivityTimer);
      });
      return {};
    }
  }
  </script>  

<style>
.content-container {
  overflow: auto;
}

body {
  background: linear-gradient(to right, #2459d5 45%, #2fe8ee 80%);
}

nav {
  display: flex;
  justify-content: center;
  color: #2fe8ee;
}

nav a {
  cursor: pointer;
  color: inherit; 
  text-decoration: none;
  margin: 0 5px;
}

nav a:hover {
  color: #000000;
}
</style>

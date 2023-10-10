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
import axios from 'axios';
import store from '@/store';
import { onMounted, onBeforeUnmount } from 'vue';
import DisplayPong from './displayPong'
  
  export default {
    components: {
      DisplayPong
    },
    setup() {

      const onBeforeUnload = async () => {
        try {
          const response = await axios.post('http://localhost:3000/auth/Logout', {}, { withCredentials: true });
          if (response.status === 200) {
            store.dispatch('authenticate', false);
            store.dispatch('activateTwoFa', response.data.partialUser.isTwoFactorAuthenticationEnabled);
          }
        } catch (error) {
          console.error("Erreur lors de la déconnexion :", error);
        }
      };

      onMounted(() => {
        window.addEventListener('beforeunload', onBeforeUnload);
      });

      onBeforeUnmount(() => {
        window.removeEventListener('beforeunload', onBeforeUnload);
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

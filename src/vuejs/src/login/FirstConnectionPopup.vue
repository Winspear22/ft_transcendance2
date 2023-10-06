<template>
    <div v-if="isFirstConnection" class="popup">
      Bienvenue! Comme c'est votre première connexion, vous pouvez modifier votre profil.
      <button @click="closeAndRedirect">Modifier le profil</button>
      <button @click="closePopup">Fermer</button>
    </div>
  </template>
  
  <script>
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'FirstConnectionPopup',
    setup() {
      const store = useStore();
      const router = useRouter();
      const isFirstConnection = store.getters.firstConnection;
  
      const closePopup = () => {
        store.dispatch('setFirstConnection', false);
      };
  
      const closeAndRedirect = () => {
        closePopup();
        router.push('/setting/ProfileModification');
      };
  
      return {
        isFirstConnection,
        closePopup,
        closeAndRedirect
      };
    }
  };
  </script>
  
  <style scoped>
  .popup {
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }
  </style>  
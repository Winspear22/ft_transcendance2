<template>
    <div>
      <!-- Ici, vous pouvez afficher les données de l'utilisateur comme vous le souhaitez. -->
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  export default {
    name: 'UserInfo',
    
    setup(props, { emit }) {
      const userData = ref(null);
      const error = ref(null);
  
      async function fetchUserData() {
        try {
          const response = await axios.get('http://localhost:3000/auth/check-auth', { withCredentials: true });
          userData.value = response.data;
  
          // Émission de l'événement personnalisé avec les données récupérées
          emit('userInfo', userData.value);
        } catch (err) {
          error.value = err.message;
        }
      }
  
      onMounted(fetchUserData);
  
      return {
        userData,
        error
      };
    }
  }
  </script>
  
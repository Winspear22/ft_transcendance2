<template>
    <button @click="deactivateTwoFa">Désactiver 2FA</button>
  </template>
  
  <script>
  import axios from 'axios';
  import { mapActions } from 'vuex';
  
  export default {
      methods: {
          ...mapActions(['activateTwoFa']),
          async deactivateTwoFa() {
              try {
                  const response = await axios.post('http://localhost:3000/auth/deactivate', {}, {withCredentials: true});
                  if (response.status === 200) {
                      this.activateTwoFa(false);
                  }
              } catch (error) {
                  console.error("Erreur lors de la désactivation du 2FA:", error);
              }
          }
      }
  }
  </script> 
<template>
    <div class="change-username">
      <input v-model="newUsername" placeholder="Entrez votre nouveau nom d'utilisateur">
      <button @click="updateUsername">Valider</button>
      <popupValidate v-if="showValidationPopup" />
    </div>
  </template>

  <script>
  import axios from 'axios';
  import popupValidate from './popupValidate.vue'; 

  export default {
    name: 'ChangeUsername',
    components: {
      popupValidate,
    },
    data() {
      return {
        newUsername: '',
        showValidationPopup: false
      };
    },
    methods: {
      async updateUsername() {
        try {
          const response = await axios.post('http://localhost:3000/user/change/username', { username: this.newUsername }, { withCredentials: true });
          if (response.status === 201) {
            this.showValidationPopup = true;
          }
        } catch (error) {
          console.error("Erreur lors du changement de nom d'utilisateur:", error);
          this.showErrorMessage("Erreur lors du changement de nom d'utilisateur");
        }
      },
      showErrorMessage(message) {
        alert(message);
      }
    }
  };
  </script>
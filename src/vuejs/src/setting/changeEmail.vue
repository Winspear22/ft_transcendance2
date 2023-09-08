<template>
    <div class="change-email">
      <input v-model="newEmail" placeholder="Entrez votre nouvel Email">
      <button @click="updateEmail">Valider</button>
      <popupValidate v-if="showValidationPopup" />
    </div>
  </template>

  <script>
  import axios from 'axios';
  import popupValidate from './popupValidate.vue'; 

  export default {
    name: 'ChangeEmail',
    components: {
      popupValidate,
    },
    data() {
      return {
        newEmail: '',
        showValidationPopup: false
      };
    },
    methods: {
      async updateEmail() {
        try {
          const response = await axios.post('http://localhost:3000/user/change/email', { email: this.newEmail }, { withCredentials: true });
          if (response.status === 201) {
            this.$emit('emailChanged', this.newEmail);
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
<template>
  <div class="change-email">
    <input class="email-input" v-model="newEmail" placeholder="Entrez votre nouvel Email">
    <button class="email-button" @click="updateEmail">Valider</button>
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
          const response = await axios.post(process.env.VUE_APP_HOSTNAME + '/user/change/email', { email: this.newEmail }, { withCredentials: true });
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

<style scoped>
.email-button {
  background-color: transparent !important;
  border: none !important;
  outline: none !important;
  color: #2fe8ee; /* Texte bleu */
  padding: 10px 20px;
  cursor: pointer; /* Changement du curseur */
  transition: color 0.3s; /* Transition douce de la couleur */
}

.email-button:hover {
  color: #000000; /* Texte noir lors du survol */
}

.email-input {
  background-color: transparent;
  border: none;
  outline: none;
  color: #2fe8ee; /* Texte bleu */
  padding: 10px;
  margin: 10px 0;
}
</style>
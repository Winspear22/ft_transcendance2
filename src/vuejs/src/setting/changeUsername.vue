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
  import store from '@/store';

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
            store.getters.gameSocket.emit('updateUser', this.newUsername);
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
.change-username {
  /* Ajoutez vos styles personnalisés pour le conteneur ici si nécessaire */
}

/* Styles pour les inputs */
.change-username input {
  padding: 10px;
  margin: 10px 0;
  color: #2fe8ee; /* Texte bleu */
  background-color: transparent; /* Fond transparent pour l'input */
  border: none; /* Pas de bordure pour l'input */
  outline: none; /* Pas de contour lors de la sélection de l'input */
}

/* Styles pour les boutons */
.change-username button {
  background-color: transparent; /* Fond transparent */
  color: #2fe8ee; /* Texte bleu */
  padding: 10px 20px;
  margin: 10px 0;
  cursor: pointer; /* Changement du curseur */
  border: none; /* Pas de bordure pour le bouton */
  transition: color 0.3s; /* Transition douce de la couleur */
}

/* Styles pour les boutons lors du survol */
.change-username button:hover {
  color: #000000; /* Texte noir lors du survol */
}
</style>

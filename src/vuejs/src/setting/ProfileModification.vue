<template>
    <div class= "modification-container">
      <changeEmail></changeEmail>
      <changeUsername></changeUsername>
      <ImageUploadComponent></ImageUploadComponent>
    </div>
</template>

<script>
import changeEmail from './changeEmail.vue';
import changeUsername from './changeUsername.vue';
import ImageUploadComponent from './ImageUploadComponent.vue';

export default {
  components: {
      ImageUploadComponent,
      changeEmail,
      changeUsername,
  },
}
</script>

<style scooped>
.modification-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrer horizontalement */
  justify-content: center; /* Centrer verticalement */
  font-family: 'Arial', sans-serif; /* Choisir la police de votre choix */
  width: 100%;
}

/* Styles pour les inputs */
.modification-container input {
  padding: 10px;
  margin: 10px 0;
  color: #2fe8ee; /* Texte bleu */
}

/* Styles pour les boutons */
.modification-container button {
  background-color: transparent; /* Fond transparent */
  color: #2fe8ee; /* Texte bleu */
  padding: 10px 20px;
  margin: 10px 0;
  cursor: pointer; /* Changement du curseur */
  transition: color 0.3s; /* Transition douce de la couleur */
}

/* Styles pour les boutons lors du survol */
.modification-container button:hover {
  color: #000000; /* Texte noir lors du survol */
}
</style>
<template>
  <div>
    <button class="delogButton" @click="logout">
      <span>Se déconnecter</span>
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    async logout() {
      try {
        const response = await axios.post('http://localhost:3000/Logout', {}, { withCredentials: true });

        if (response.status === 201) {
          this.$emit('logout-success');
        }
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
    }
  }
};
</script>


<style scoped>
.delogButton {
  background-color: #2459d5;  /* Couleur de fond bleue */
  color: #2fe8ee;             /* Écriture en bleu clair */
  border: none;
  padding: 10px 20px;
  font-size: 10px;
  cursor: pointer;            /* Le curseur devient une main pour indiquer qu'il s'agit d'un bouton cliquable */
  border-radius: 5px;         /* Ajoutez un léger arrondi au bouton pour un style moderne */
  transition: background-color 0.3s; /* Transition pour le changement de couleur lors du survol */
  margin: 0;
}

.delogButton:hover {
  background-color: #1d4fb3;  /* Une teinte légèrement plus foncée de bleu pour l'effet de survol */
}
</style>
<template>
  <div>
    <label class="file-input-label" for="fileInput">Choisir le fichier</label>
    <input id="fileInput" type="file" @change="onFileChange" style="display: none;">
    <button class="upload-btn" @click="uploadImage" v-if="selectedFile">Envoyer l'image</button>
    <popupValidate v-if="showValidationPopup" />
  </div>
</template>

<script>
import axios from 'axios';
import popupValidate from './popupValidate.vue';

export default {
  components: {
    popupValidate,
  },
  data() {
    return {
      selectedFile: null,
      showValidationPopup: false
    };
  },
  methods: {
    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (!files.length) return;
      this.selectedFile = files[0];
    },
    async uploadImage() {
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        try {
          const response = await axios.post(process.env.VUE_APP_HOSTNAME + '/user/change/pp', formData, { withCredentials: true });
          if (response && response.status === 201) {
            this.showValidationPopup = true;
          }
        } catch (error) {
          console.error("Erreur lors de l'envoi de l'image:", error);
        }
      }
    }
  }
};
</script>

<style scoped>
.file-input-label {
    display: inline-block;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: transparent; /* Aucune couleur de fond */
    color: #2fe8ee; /* Couleur de texte bleue */
    cursor: pointer; /* Changement du curseur au survol */
    font-size: 16px;
    transition: color 0.3s; /* Transition douce pour le changement de couleur */
}

.file-input-label:hover {
    color: #000000; /* Changement de la couleur à noir lorsque la souris passe dessus */
}

.upload-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: transparent;
    color: #2fe8ee;
    cursor: pointer;
    font-size: 16px;
    transition: color 0.3s;
}

.upload-btn:hover {
    color: #000000;
}
</style>
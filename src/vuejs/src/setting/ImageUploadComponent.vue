<template>
  <div>
    <input type="file" @change="onFileChange">
    <button @click="uploadImage" v-if="selectedFile">Envoyer l'image</button>

    <popupValidate v-if="showValidationPopup" />
  </div>
</template>

<script>
import axios from 'axios';
import popupValidate from './popupValidate.vue'; // Assurez-vous que le chemin est correct

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
          const response = await axios.post('http://localhost:3000/user/change/pp', formData, { withCredentials: true });
          console.log('Réponse du serveur:', response.status);

          // Si la réponse du serveur est satisfaisante, affichez la popup.
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

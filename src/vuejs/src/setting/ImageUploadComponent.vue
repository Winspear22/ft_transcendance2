<template>
    <div>
      <input type="file" @change="onFileChange">
      <button @click="uploadImage" v-if="selectedFile">Envoyer l'image</button>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        selectedFile: null
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
            console.log('Réponse du serveur:', response.data);
          } catch (error) {
            console.error("Erreur lors de l'envoi de l'image:", error);
          }
        }
      }
    }
  };
  </script>
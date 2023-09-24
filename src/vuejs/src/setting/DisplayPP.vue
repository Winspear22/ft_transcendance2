<template>
  <div class="profile-picture-container">
    <img v-if="userInfo && imageSrc" :src="imageSrc" alt="Profile Picture" />
    <p v-else>Aucune photo de profil disponible</p>
  </div>
</template>

<script>
export default {
  name: 'displayPP',
  props: {
    userInfo: {
      type: Object,
      default: null,
    },
  },
  computed: {
    imageSrc() {
      if (!this.userInfo || !this.userInfo.profile_picture) {
        return null;
      }
      if (this.userInfo.profile_picture.startsWith('https://cdn.intra.42.fr/users/')) {
        return require('@/assets/1.png');
      }
      return require(`@/assets/${this.userInfo.profile_picture}`);
    },
  },
};
</script>

<style scoped>
.profile-picture-container {
    display: flex;
    justify-content: center; /* Horizontalement centrer */
    align-items: center;     /* Verticalement centrer */
    width: 100px;            /* Largeur du conteneur */
    height: 100px;           /* Hauteur du conteneur */
    border-radius: 50%;      /* Pour rendre le conteneur rond */
    overflow: hidden;        /* Cela s'assure que l'image ne déborde pas du conteneur */
    margin-top: 20px;        /* Utilisez cette marge pour décaler l'image vers le bas */
}

.profile-picture-container img {
    max-width: 100%;         /* Largeur maximale de l'image à 100% du conteneur */
    max-height: 100%;        /* Hauteur maximale de l'image à 100% du conteneur */
    object-fit: cover;       /* Pour conserver l'aspect ratio tout en couvrant tout le conteneur */
}
</style>
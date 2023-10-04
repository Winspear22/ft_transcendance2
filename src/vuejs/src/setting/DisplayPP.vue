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
    justify-content: center; 
    align-items: center;    
    width: 100px;      
    height: 100px;       
    border-radius: 50%;     
    overflow: hidden;       
    margin-top: 20px;    
}

.profile-picture-container img {
    max-width: 100%;     
    max-height: 100%;    
    object-fit: cover;  
}
</style>
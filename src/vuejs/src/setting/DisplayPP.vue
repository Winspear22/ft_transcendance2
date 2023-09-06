<template>
    <div class="profile-picture-container">
      <img v-if="userInfo && userInfo.profile_picture" :src="userInfo.profile_picture" alt="Profile Picture" />
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
  };
  </script>
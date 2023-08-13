<template>
    <div class="user-info" v-if="infoUser">
        <h2>Informations utilisateur:</h2>
        <img :src="infoUser.profile_picture" alt="Profile Picture" />
        <p><strong>Username:</strong> {{ infoUser.username }}</p>
        <p><strong>Email:</strong> {{ infoUser.email }}</p>
        <p><strong>Status:</strong> {{ infoUser.user_status }}</p>
    </div>
</template>

<script>
export default {
    props: {
        infoUser: {
            type: Object,
            default: () => ({})
        }
    }
};
</script>

<style scoped>
  .user-info {
      text-align: center;
  }

  img {
      width: 100px; /* ou toute autre taille que vous préférez */
      height: auto;
      border-radius: 50%; /* pour rendre l'image circulaire */
  }
</style>
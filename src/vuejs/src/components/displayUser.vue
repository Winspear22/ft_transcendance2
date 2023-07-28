<template>
    <div v-if="userInfo" class="user-info">
      <img :src="userInfo.profile_picture" alt="User profile picture" class="user-image" />
      <p>{{ userInfo.username }}</p>
      <p>{{ userInfo.email }}</p>
    </div>
</template>

<script>
export default {
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  }
};
</script>

<style scoped>
.user-info {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 20px;              
    border: 2px solid #2fe8ee;  
    border-radius: 10px;        
    box-sizing: border-box;     
    display: flex;              /* Activer Flexbox */
    flex-direction: column;     /* Empiler les éléments verticalement */
    align-items: center;        /* Centrer horizontalement */
    justify-content: center;    /* Centrer verticalement */
    color: #2fe8ee; 
}

.user-info p {
    margin: 0;       /* Réinitialise toutes les marges */
    margin-bottom: 0;  /* Ajout d'une marge en bas pour l'espacement entre les éléments <p> */
}

.user-info p:last-child {
    margin-bottom: 0;  /* Réinitialise la marge du dernier élément <p> pour qu'il n'y ait pas d'espacement supplémentaire en bas */
}

.user-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-bottom: 10px; 
    border: 2px solid #2fe8ee; /* Ajout d'une bordure à l'image */
}

</style>
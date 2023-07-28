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
}

.user-image {
    width: 50px;  
    height: 50px; 
    border-radius: 50%;
}
</style>

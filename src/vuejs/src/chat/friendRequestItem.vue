<template>
    <div class="friend-request-item">
      <img :src="request.profile_picture" alt="Profile" />
      <span>{{ request.username }}</span>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FriendRequestItem',
    props: {
      request: {
        type: Object,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .friend-request-item {
    display: flex;
    align-items: center;
    margin-bottom: 1em;
  }
  
  .friend-request-item img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 0.5em;
  }
  </style>  
<!-- NotificationModal.vue -->
<template>
    <div v-if="visible" class="notification-change">
      {{ message }}
    </div>
  </template>
  
  <script>
  export default {
    props: ['visible', 'message']
  }
  </script>
  
  <style scoped>
  .notification-change {
      position: fixed;
      top: 10%;
      right: 10%;
      padding: 15px;
      background-color: red;
      border-radius: 8px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      z-index: 9999;
  }
  </style>
  
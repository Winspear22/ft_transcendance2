<template>
    <div v-if="visible" class="notification">
      {{ message }}
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        visible: true
      };
    },
    created() {
      setTimeout(() => {
        this.visible = false;
      }, 5000); // 5 secondes
    }
  };
  </script>
  
  <style>
  .notification {
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 15px;
    background-color: #ffdd57;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }
  </style>
  
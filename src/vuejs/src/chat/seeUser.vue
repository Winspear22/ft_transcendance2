<template>
    <div class="see-user-modal">
      <button class="close-btn" @click="$emit('close')">✖️</button>
      <h2>Liste des utilisateurs</h2>
      <ul>
        <li v-for="user in usersDTO" :key="user.id">{{ user.username }}</li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      usersDTO: {
        type: Array,
        required: true
      },
    },
    mounted() {
      console.log("Les users dans seeUser", this.usersDTO);
    }
  }
  </script>
  
  <style scoped>
  .see-user-modal {
    width: 300px;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
  }
  
  .close-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  </style>
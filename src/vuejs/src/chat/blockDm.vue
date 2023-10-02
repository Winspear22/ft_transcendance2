<template>
    <div>
      <div class="block-dm-button" @click="confirmBlock"> ✖ </div>
      <!-- Confirmation Modal -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <p>Voulez-vous bloquer les DM de {{ username }} ? Cela entraînera la suppression de cette personne de votre liste d'amis.</p>
          <button @click="blockUser">Confirmer</button>
          <button @click="showModal = false">Annuler</button>
        </div>
      </div>
    </div>
  </template>
  
  
  <script>
  export default {
    props: {
      chat: Object,
      userInfo: Object
    },
    data() {
      return {
        showModal: false
      };
    },
    computed: {
      username() {
        return this.chat.users.find(u => u.username !== this.userInfo.username).username;
      }
    },
    methods: {
      confirmBlock() {
        this.showModal = true;
      },
      blockUser() {
        this.$emit('block', this.chat);
        this.showModal = false;
      }
    }
  };
  </script>
  
  <style scoped>
  .block-dm-button {
    cursor: pointer;
    color: #2fe8ee;
    margin-left: 10px;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width: 300px;
    text-align: center;
  }
  
  .modal-content button {
    margin-top: 20px;
    padding: 10px 20px;
  }
  </style>
  
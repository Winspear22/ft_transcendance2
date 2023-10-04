<template>
    <div class="unmute-user-modal">
      <infoUser @userInfoFetched="setUserInfo"></infoUser>
      <!-- Header Section -->
      <h3>Retirer la mise en sourdine d'un utilisateur</h3>

      <!-- User Input Section -->
      <label>
        Nom d'utilisateur à désactiver la mise en sourdine :
        <input v-model="targetUsername" placeholder="Nom d'utilisateur" />
      </label>

      <!-- Action Buttons Section -->
      <button @click="unmuteUser">Retirer la mise en sourdine</button>
      <button @click="closeModal">Fermer</button>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import infoUser from '../setting/infoUser'; 

export default {
    components: {
        infoUser
    },
    props: ['roomName'],

    data() {
      return {
        targetUsername: '',
        username: ''
      };
    },

    computed: {
      ...mapGetters(['socketChat'])
    },

    methods: {
      unmuteUser() {
        if (!this.targetUsername.trim()) {
          alert('Veuillez entrer un nom d\'utilisateur valide.');
          return;
        }

        this.socketChat.emit('unmuteUser', {
          username: this.username,
          roomName: this.roomName,
          targetUsername: this.targetUsername
        });
        this.closeModal();
      },

      setUserInfo(userInfo) {
        this.username = userInfo.username;
      },

      closeModal() {
        this.$emit('close');
      },
    }
}
</script>


<style scoped>
  /* Modal Styling */
  .unmute-user-modal {
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

  /* Header Styling */
  .unmute-user-modal h3 {
    margin-top: 0;
  }

  /* Label Styling */
  .unmute-user-modal label {
    display: block;
    margin-bottom: 10px;
  }

  /* Input Styling */
  .unmute-user-modal input {
    width: 100%;
    padding: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  /* Button Styling */
  .unmute-user-modal button {
    padding: 5px 10px;
    border: none;
    background-color: #007bff;
    color: #fff;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .unmute-user-modal button:hover {
    background-color: #0056b3;
  }

  .unmute-user-modal button:last-child {
    margin-left: 10px;
    background-color: #ccc;
    color: #333;
  }

  .unmute-user-modal button:last-child:hover {
    background-color: #aaa;
  }
</style>
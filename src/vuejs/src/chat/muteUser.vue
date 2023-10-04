<template>
    <div class="mute-user-modal">
      <infoUser @userInfoFetched="setUserInfo"></infoUser>
      <!-- Header Section -->
      <h3>Mettre un utilisateur en sourdine</h3>

      <!-- User Input Section -->
      <label>
        Nom d'utilisateur à mettre en sourdine :
        <input v-model="targetUsername" placeholder="Nom d'utilisateur" />
      </label>

      <label>
        Durée (en secondes) :
        <input type="number" v-model="duration" placeholder="Durée" />
      </label>

      <!-- Action Buttons Section -->
      <button @click="muteUser">Mettre en sourdine</button>
      <button @click="closeModal">Fermer</button>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import infoUser from '../setting/infoUser'; // Adaptez le chemin selon votre structure de dossiers

export default {
    components: {
        infoUser
    },
    props: ['roomName'],

    data() {
      return {
        targetUsername: '',
        duration: 0,
        username: ''
      };
    },

    computed: {
      ...mapGetters(['socketChat'])
    },

    methods: {
      // ####################
      // MAIN METHODS
      // ####################

      muteUser() {
        if (!this.targetUsername.trim() || this.duration <= 0) {
          alert('Veuillez entrer un nom d\'utilisateur valide et une durée valide.');
          return;
        }

        this.socketChat.emit('muteUser', {
          username: this.username,
          roomName: this.roomName,
          targetUsername: this.targetUsername,
          duration: this.duration
        });
        this.closeModal();
      },

      // ####################
      // UTILITY METHODS
      // ####################

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
  .mute-user-modal {
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
  .mute-user-modal h3 {
    margin-top: 0;
  }

  /* Label Styling */
  .mute-user-modal label {
    display: block;
    margin-bottom: 10px;
  }

  /* Input Styling */
  .mute-user-modal input {
    width: 100%;
    padding: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  /* Button Styling */
  .mute-user-modal button {
    padding: 5px 10px;
    border: none;
    background-color: #007bff;
    color: #fff;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .mute-user-modal button:hover {
    background-color: #0056b3;
  }

  .mute-user-modal button:last-child {
    margin-left: 10px;
    background-color: #ccc;
    color: #333;
  }

  .mute-user-modal button:last-child:hover {
    background-color: #aaa;
  }
</style>

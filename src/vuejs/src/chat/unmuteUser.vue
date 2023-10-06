<template>
  <div class="modal">
    <div class="modal-content">
      <!-- Header Section -->
      <h3>Démuté un utilisateur</h3>

      <!-- User Input Section -->
      <label>
          Nom d'utilisateur :
          <input v-model="targetUsername" />
      </label>

      <!-- Message Response -->
      <p v-if="unmuteMessage" class="unmute-message">{{ unmuteMessage }}</p>

      <info-user @userInfoFetched="handleUserInfo"></info-user>
      <!-- Action Buttons Section -->
      <button @click="unmuteUser">Démuté</button>
      <button @click="closeModal">Fermer</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import infoUser from '../setting/infoUser';

export default {
  props: ['roomName'],

  components: {
    infoUser
  },

  data() {
      return {
          targetUsername: '',
          unmuteMessage: null
      };
  },

  computed: {
      ...mapGetters(['socketChat'])
  },

  mounted() {
      this.socketChat.on('unmuteUser', this.handleUnmuteResponse);
  },

  beforeDestroy() {
      this.socketChat.off('unmuteUser', this.handleUnmuteResponse);
  },

  methods: {
    handleUserInfo(userInfo) {
        this.currentUserInfo = userInfo;
    },
    unmuteUser() {
        if (!this.targetUsername.trim()) {
            alert('Veuillez entrer un nom d\'utilisateur valide.');
            return;
        }

        this.socketChat.emit('unmuteUser', {
            username: this.currentUserInfo.username,
            roomName: this.roomName,
            targetUsername: this.targetUsername
        });
    },
    handleUnmuteResponse(data) {
      if (data.error) {
        this.unmuteMessage = "Erreur lors de la démétir de l'utilisateur: " + data.error;
      } else {
        this.unmuteMessage = `L'utilisateur ${this.targetUsername} a été démuté`;
      }
      setTimeout(this.closeModal, 2000);
    },
    closeModal() {
        this.$emit('close');
    }
  }
}
</script>



<style scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0,0,0,0.7);
}

.modal-content {
  width: 300px;
  padding: 20px;
  background: linear-gradient(to left, #2fe8ee, #2459d5); 
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

button {
  margin-top: 10px;
  padding: 5px 15px;
  background-color: transparent;
  border: 1px solid #2fe8ee;
  color: #2fe8ee;
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

button:hover {
  background-color: #2fe8ee;
  color: black;
}

.invite-message {
  margin-top: 10px;
  color: #2fe8ee;
  font-weight: bold;
}

input {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: transparent;
  border: 1px solid #2fe8ee;
  border-radius: 5px;
  color: #2fe8ee;
  transition: background-color 0.2s, color 0.2s;
}

input:hover, input:focus {
  background-color: #2fe8ee;
  color: black;
}
</style>
<template>
  <div class="modal">
    <div class="modal-content">
      <!-- Header Section -->
      <h3>Mettre un utilisateur en sourdine</h3>

      <!-- User Input Section -->
      <label>
          Nom d'utilisateur :
          <input v-model="targetUsername" />
      </label>

      <label>
          Durée (en secondes) :
          <input v-model.number="duration" />
      </label>

      <!-- Message Response -->
      <p v-if="inviteMessage" class="invite-message">{{ inviteMessage }}</p>

      <info-user @userInfoFetched="handleUserInfo"></info-user>
      <!-- Action Buttons Section -->
      <button @click="muteUser">Mettre en sourdine</button>
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
          duration: 0,
          inviteMessage: null
      };
  },

  computed: {
      ...mapGetters(['socketChat'])
  },

  mounted() {
      this.socketChat.on('muteUser', this.handleMuteResponse);
  },

  beforeDestroy() {
      this.socketChat.off('muteUser', this.handleMuteResponse);
  },

  methods: {
    handleUserInfo(userInfo) {
        this.currentUserInfo = userInfo;
    },
      muteUser() {
          if (!this.targetUsername.trim() || this.duration <= 0 || this.duration > 600 ) {
              alert('Veuillez entrer un nom d\'utilisateur valide et une durée valide (max 10min).');
              return;
          }

          this.socketChat.emit('muteUser', {
              username: this.currentUserInfo.username,
              channelName: this.roomName,
              targetUsername: this.targetUsername,
              duration: this.duration
          });
      },
      handleMuteResponse(data) {
        console.log("data", data);
        if (data.error) {
          this.inviteMessage = "Erreur lors de la mise en sourdine de l'utilisateur: " + data.error;
        } else if (data.message && data.success) {
          this.inviteMessage = `L'utilisateur ${this.targetUsername} a été mis en sourdine pour ${this.duration} secondes`;
        } else {
            this.inviteMessage = "Erreur inattendue";
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
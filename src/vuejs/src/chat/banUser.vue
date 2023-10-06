<template>
  <div class="modal">
    <div class="modal-content">
      <!-- Header Section -->
      <h3>Bannir un utilisateur</h3>

      <!-- User Input Section -->
      <label>
          Nom d'utilisateur :
          <input v-model="targetUsername" />
      </label>

      <!-- Message Response -->
      <p v-if="inviteMessage" class="invite-message">{{ inviteMessage }}</p>

      <!-- Action Buttons Section -->
      <button @click="banUser">Bannir</button>
      <button @click="closeModal">Fermer</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['channelName'],

  data() {
      return {
          targetUsername: '',
          inviteMessage: null
      };
  },

  computed: {
      ...mapGetters(['socketChat'])
  },

  mounted() {
      this.socketChat.on('banUser', this.handleBanResponse);
  },

  beforeDestroy() {
      this.socketChat.off('banUser', this.handleBanResponse);
  },

  methods: {
      banUser() {
          if (!this.targetUsername.trim()) {
              alert('Veuillez entrer un nom d\'utilisateur valide à bannir.');
              return;
          }

          this.socketChat.emit('banUser', {
              channelName: this.channelName,
              targetUsername: this.targetUsername,
          });
      },

      handleBanResponse(data) {
    
        // Si data est un objet et contient la propriété message
        if (data.message) {
          if (data.includes(`You have successfully banned ${data.targetUsername} from room ${data.channelName}`)) {
            this.inviteMessage = "Utilisateur banni";}
         else   
          this.inviteMessage = "Ban impossible";
          setTimeout(this.closeModal, 2000);
        }
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

.close {
  position: absolute;
  right: 10px;
  top: 10px;
  background-color: transparent;
  border: none;
  color: #2fe8ee;
  cursor: pointer;
  font-size: 24px;
}

.close:hover {
  color: black;
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

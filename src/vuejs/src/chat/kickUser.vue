<template>
  <div class="kick-user-modal modal">
    <!-- Header Section -->
    <h3>Expulser un utilisateur</h3>

    <!-- User Input Section -->
    <label>
      Nom d'utilisateur :
      <input v-model="targetUsername" />
    </label>

    <!-- Message Display Section -->
    <p class="invite-message" v-if="inviteMessage">{{ inviteMessage }}</p>

    <!-- Action Buttons Section -->
    <button @click="kickUser">Expulser</button>
    <button @click="closeModal">Fermer</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['channelName'],

  data() {
    return {
      targetUsername: '',
      inviteMessage: ''
    };
  },

  computed: {
    ...mapGetters(['socketChat'])
  },

  mounted() {
    this.socketChat.on('kickUser', this.handleKickResponse);
  },

  beforeDestroy() {
    this.socketChat.off('kickUser', this.handleKickResponse);
  },

  methods: {
    // ####################
    // MAIN METHODS
    // ####################

    kickUser() {
      if (!this.targetUsername.trim()) {
        alert('Veuillez entrer un nom d\'utilisateur valide à expulser.');
        return;
      }

      this.socketChat.emit('kickUser', {
        channelName: this.channelName,
        targetUsername: this.targetUsername,
      });
    },

    handleKickResponse(data) {
      if (typeof data === "string" && data.includes("Error")) {
        this.inviteMessage = "Impossible d'expulser cette personne";
      } else if (data.message && data.message.includes("successfully kicked")) {
        this.inviteMessage = "Expulsion réussie";
      } else {
        this.inviteMessage = "Erreur inattendue";
      }
      setTimeout(this.closeModal, 2000);
    },

    // ####################
    // UTILITY METHODS
    // ####################

    closeModal() {
      this.inviteMessage = ''; // Resetting the message
      this.$emit('close');
    },
  }
}
</script>

<style scoped>
.modal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: linear-gradient(to left, #2fe8ee, #2459d5);
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 300px;
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
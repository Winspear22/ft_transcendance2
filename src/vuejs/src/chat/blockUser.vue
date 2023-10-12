<template>
  <span v-if="!isCurrentUser(user)">
      <button @click="confirmBlockUser(user)" class="block-button">Bloquer</button>
      <div v-if="showConfirmation" class="modal">
          <div class="modal-content">
              <p class="confirm-message">Êtes-vous sûr de vouloir bloquer {{ user.username }} ?</p>
              <button @click="blockUser(user)" class="confirm-button">Oui</button>
              <button @click="showConfirmation = false" class="cancel-button">Non</button>
          </div>
      </div>
      <div v-if="feedbackMessage" class="modal">
          <div class="modal-content">
              <p class="feedback-message">{{ feedbackMessage }}</p>
              <button @click="feedbackMessage = null" class="close-feedback">Fermer</button>
          </div>
      </div>
  </span>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
props: ['channelName', 'user', 'currentUserId'],

data() {
  return {
    showConfirmation: false,
    feedbackMessage: null
  };
},

computed: {
  ...mapGetters(['socketChat'])
},

mounted() {
  this.socketChat.on('blockUserChat', this.handleFeedbackFromServer);
},

beforeDestroy() {
  this.socketChat.off('blockUserChat', this.handleFeedbackFromServer);
},

methods: {
  isCurrentUser(user) {
      return this.currentUserId && user.id === this.currentUserId;
  },

  confirmBlockUser() {
      this.showConfirmation = true;
  },

  blockUser(user) {
    this.socketChat.emit('blockUserChat', {
      channelName: this.channelName,
      TargetUserId: user.id
    });
    this.showConfirmation = false;
  },

  handleFeedbackFromServer(message) {
      this.feedbackMessage = message;
  }
}
}
</script>

<style scoped>
.block-button {
background: none;
border: none;
color: #2fe8ee;
cursor: pointer;
margin-left: 5px;
padding: 0;
font-weight: bold;
font-size: 16px;
transition: color 0.2s;
}

.block-button:hover {
color: black;
}

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

.confirm-message, .feedback-message {
color: black;
font-weight: bold;
}

button.confirm-button, button.cancel-button, button.close-feedback {
margin-top: 10px;
padding: 5px 15px;
background-color: transparent;
border: 1px solid #2fe8ee;
color: #2fe8ee;
border-radius: 5px;
cursor: pointer;
transition: color 0.2s, background-color 0.2s;
}

button.confirm-button:hover, button.cancel-button:hover, button.close-feedback:hover {
background-color: #2fe8ee;
color: black;
}
</style>

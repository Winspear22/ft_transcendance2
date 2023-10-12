<template>
    <span v-if="!isCurrentUser(user)">
        <button @click="confirmUnblockUser(user)" class="unblock-button">Débloquer</button>
        <div v-if="showConfirmation" class="modal">
            <div class="modal-content">
                <p class="confirm-message">Êtes-vous sûr de vouloir débloquer {{ user.username }} ?</p>
                <button @click="unblockUser(user)" class="confirm-button">Oui</button>
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
    this.socketChat.on('unblockUserChat', this.handleFeedbackFromServer);
  },
  
  beforeDestroy() {
    this.socketChat.off('unblockUserChat', this.handleFeedbackFromServer);
  },
  
  methods: {
    isCurrentUser(user) {
        return this.currentUserId && user.id === this.currentUserId;
    },
  
    confirmUnblockUser() {
        this.showConfirmation = true;
    },
  
    unblockUser(user) {
      this.socketChat.emit('unblockUserChat', {
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
  .unblock-button {
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
  
  .unblock-button:hover {
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
  
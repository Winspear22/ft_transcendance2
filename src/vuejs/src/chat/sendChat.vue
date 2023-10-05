<template>
  <div class="dm-send-container">
    <info-user @userInfoFetched="updateSenderUsername"></info-user>

    <div class="message-input-container">
      <!-- Message Input -->
      <textarea v-model="messageContent" 
                @keyup.enter="sendMessage" 
                placeholder="Écrivez votre message..."></textarea>
      
      <!-- Send Button -->
      <button @click="sendMessage">Envoyer</button>
    </div>
  </div>
</template>

<script>
import InfoUser from '../setting/infoUser';

export default {
  components: { InfoUser },

  props: ['selectedRoom'],

  data() {
    return {
      messageContent: "",
      senderUsername: null
    };
  },

  methods: {
    sendMessage() {
      if (this.isValidSender()) {
        this.emitMessageToSocket();
        this.clearMessageContent();
      } else {
        console.error("Nom d'utilisateur non défini. Ne peut pas envoyer le message.");
      }
    },

    updateSenderUsername(userInfo) {
      this.senderUsername = userInfo.username;
    },

    isValidSender() {
      return !!this.senderUsername;
    },

    emitMessageToSocket() {
      this.$store.getters.socketChat.emit('sendMessage', {
        channelName: this.selectedRoom.roomName,
        senderUsername: this.senderUsername,
        message: this.messageContent
      });
    },

    clearMessageContent() {
      this.messageContent = "";
    }
  },

  watch: {
    selectedRoom: {
      handler(newRoom, oldRoom) {
        if (newRoom && newRoom !== oldRoom) {
          this.clearMessageContent();
        }
      },
      deep: true
    }
  }
};
</script>
<style scoped>
.dm-send-container {
  display: flex;
  flex-direction: column;
}

.message-input-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

textarea {
  flex: 1;
  padding: 0.5rem;
  background-color: transparent;
  color: black;
  border: 1px solid #2fe8ee;
  border-radius: 4px;
  resize: vertical;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #0b3d91; /* bleu foncé */
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #092965; /* une teinte légèrement plus claire de bleu foncé */
}
</style>
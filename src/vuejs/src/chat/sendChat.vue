<template>
  <div>
    <!-- User Information Component -->
    <info-user @userInfoFetched="updateSenderUsername"></info-user>
    
    <!-- Message Input -->
    <textarea v-model="messageContent"></textarea>
    
    <!-- Send Button -->
    <button @click="sendMessage">Envoyer</button>
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
    // Sends the current message to the socket
    sendMessage() {
      if (!this.isValidSender()) {
        console.error("Nom d'utilisateur non défini. Ne peut pas envoyer le message.");
        return;
      }
      this.emitMessageToSocket();
      this.clearMessageContent();
    },

    // Updates the sender's username from userInfo emitted from <info-user>
    updateSenderUsername(userInfo) {
      this.senderUsername = userInfo.username;
    },

    // Utility methods for cleaner code
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
  
  // Watching for changes in selectedRoom
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

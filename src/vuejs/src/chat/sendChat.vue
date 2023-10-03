<template>
    <div>
      <!-- User Information Component -->
      <info-user @userInfoFetched="updateSenderUsername"></info-user>
  
      <!-- Message Input -->
      <textarea v-model="messageContent" placeholder="Écrivez votre message..."></textarea>
  
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
      // ####################
      // MAIN METHODS
      // ####################
  
      // Sends the current message to the socket
      sendMessage() {
        if (this.isValidSender()) {
          this.emitMessageToSocket();
          this.clearMessageContent();
        } else {
          console.error("Nom d'utilisateur non défini. Ne peut pas envoyer le message.");
        }
      },
  
      // Updates the sender's username based on the emitted userInfo from <info-user>
      updateSenderUsername(userInfo) {
        this.senderUsername = userInfo.username;
      },
  
      // ####################
      // UTILITY METHODS
      // ####################
  
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
  
    // ####################
    // WATCHERS
    // ####################
  
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
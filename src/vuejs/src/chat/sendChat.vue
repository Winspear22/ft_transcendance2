<template>
    <div>
      <info-user @userInfoFetched="updateSenderUsername"></info-user>
      <textarea v-model="messageContent"></textarea>
      <button @click="sendMessage">Envoyer</button>
    </div>
  </template>
  
  <script>
  import InfoUser from '../setting/infoUser';
  
  export default {
    components: {
      InfoUser,
    },
    props: ['selectedRoom'],
    data() {
      return {
        messageContent: "",
        senderUsername: null
      };
    },
    methods: {
      sendMessage() {
        if (!this.senderUsername) {
          console.error("Nom d'utilisateur non défini. Ne peut pas envoyer le message.");
          return;
        }
  
        this.$store.getters.socketChat.emit('sendMessage', {
          channelName: this.selectedRoom.roomName,
          senderUsername: this.senderUsername,
          message: this.messageContent
        });
        this.messageContent = "";
      },
      updateSenderUsername(userInfo) {
        this.senderUsername = userInfo.username;
      }
    }
  }
  </script>
  
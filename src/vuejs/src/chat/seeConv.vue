<template>
    <div>
      <h3>Chat with {{ chatName }}</h3>
      <div v-if="chat?.messages && chat.messages.length > 0">
        <div v-for="message in chat.messages" :key="message.id">
          <span>{{ message.senderName }}: {{ message.text }}</span>
        </div>
      </div>
      <div v-else>
        <p>No messages yet. Start a conversation!</p>
      </div>
    </div>
</template>
  
<script>
export default {
    props: {
      chat: Object,
      userInfo: Object, // Propriété pour passer les informations de l'utilisateur
    },
    computed: {
      chatName() {
        if (this.chat?.users.length > 0) {
          if (this.userInfo && this.chat.users[0].username !== this.userInfo.username) {
            return this.chat.users[0].username;
          } else if (this.chat.users.length > 1) {
            return this.chat.users[1].username;
          }
        }
        return "Unknown";
      },
    },
};
</script> 

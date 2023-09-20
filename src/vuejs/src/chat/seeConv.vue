<template>
  <div>
    <h3>Chat with {{ chatName }}</h3>
    <div v-if="chat?.messages && chat.messages.length > 0">
      <div v-for="message in chat.messages" :key="message.id">
        <span>{{ getSenderName(message.senderId) }}: {{ message.text }}</span>
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
    userInfo: Object,
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
  methods: {
    getSenderName(senderId) {
      // Chercher le nom de l'expéditeur en fonction de senderId
      const sender = this.chat.users.find(user => user.id === senderId);
      return sender ? sender.username : "Unknown";
    }
  }
};
</script>
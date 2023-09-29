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
import { getChatUserName } from './dmName';

export default {
  props: {
    chat: Object,
    userInfo: Object,
  },
  computed: {
    chatName() { return getChatUserName(this.chat, this.userInfo); },
  },
  methods: {
    getSenderName(senderId) {
      if (!this.chat || !this.chat.users) return "Unknown";
      const sender = this.chat.users.find(user => user.id === senderId);
      return sender ? sender.username : "Unknown";
    }
  }
};
</script>
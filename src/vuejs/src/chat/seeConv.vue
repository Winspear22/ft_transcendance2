<template>
  <div class="chat-window">
    <h3>{{ chatName }}</h3>
    <div class="messages" v-if="chat?.messages && chat.messages.length > 0" ref="messagesContainer">
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
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
  },
  watch: {
    'chat.messages': {
      handler() {
        this.scrollToBottom();
      },
      deep: true
    }
  },
  mounted() { // Ajout du cycle de vie "mounted"
    this.scrollToBottom();
  }
}
</script>


<style scoped>
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 500px; /* À ajuster selon vos besoins */
}

.messages {
  flex: 1;
  max-height: 400px; /* À ajuster selon vos besoins */
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>

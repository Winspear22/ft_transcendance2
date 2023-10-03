<template>
    <div class="chat-window">
      <h3>{{ chatName }}</h3>
      <div class="messages" v-if="hasMessages" ref="messagesContainer">
        <div v-for="message in chat.messages" :key="message.id">
          <span>{{ getSenderName(message.senderId) }}: {{ message.text }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { getChatUserName } from './dmName';
  
  export default {
    name: 'ChatWindow',
  
    props: {
      chat: {
        type: Object,
        required: true,
        default: () => ({})
      },
      userInfo: {
        type: Object,
        required: true,
        default: () => ({})
      },
    },
  
    computed: {
      chatName() {
        return getChatUserName(this.chat, this.userInfo);
      },
  
      hasMessages() {
        return this.chat?.messages && this.chat.messages.length > 0;
      }
    },
  
    methods: {
      getSenderName(senderId) {
        if (!this.chat?.users) return "Unknown";
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
        immediate: true, // Start the watcher immediately on component creation
        handler() {
          this.scrollToBottom();
        },
        deep: true
      }
    }
  }
  </script>
  
  <style scoped>
  .chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 500px;
  }
  
  .messages {
    flex: 1;
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  </style>
  
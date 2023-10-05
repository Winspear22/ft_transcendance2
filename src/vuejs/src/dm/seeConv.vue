Copy code
<template>
    <div class="chat-window">
      <h3>
        <router-link class="chat-name-link" :to="`/friend-profile/${chatName}`">{{ chatName }}</router-link>
      </h3>
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
        immediate: true,
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
  .chat-name-link {
    color: #2fe8ee; /* Couleur bleue de votre charte graphique */
    text-decoration: none; /* Supprime le soulignement par défaut */
    transition: color 0.3s; /* Transition pour le survol */
}
.chat-name-link:hover, 
.chat-window .chat-name-link:hover {
    color: black; /* Couleur au survol */
}
/* Pour s'assurer qu'il n'y a pas de changement de couleur sur les liens déjà cliqués */
.chat-name-link:visited {
    color: #2fe8ee; /* Même couleur bleue que le lien non visité */
}
  </style>
  
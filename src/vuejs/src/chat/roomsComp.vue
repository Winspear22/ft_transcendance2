<template>
  <div class="dm-container">
    <!-- Room List -->
    <div v-if="rooms.length" class="rooms-list">
      <div v-for="room in rooms" :key="room.id" 
           @click="selectRoom(room)" 
           :class="{ active: selectedRoom === room }">
        <span class="chat-name">{{ room.roomName }}</span>
        <see-setting :channel-name="room.roomName"></see-setting>
      </div>
    </div>
    
    <!-- Separator -->
    <div class="vertical-separator"></div>
    
    <!-- Chat Window -->
    <div v-if="selectedRoom" class="selected-chat">
      <h3>{{ selectedRoom.roomName }}</h3>
      <ul>
        <li v-for="message in selectedRoom.messages" :key="message.id">
          {{ getSenderName(message) }}: {{ message.text }}
        </li>
      </ul>
      <send-chat :selected-room="selectedRoom"></send-chat>
    </div>
  </div>
</template>



<script>
import SendChat from './sendChat.vue';
import SeeSetting from './seeSetting.vue';


export default {
  components: { SendChat, SeeSetting },

  data() {
    return {
      rooms: [],
      selectedRoom: null,
      processedMessageIds: [],
    };
  },

  computed: {
    socketChat() {
      return this.$store.getters.socketChat;
    },
    isSocketListenersAttachedFromStore() {
      return this.$store.getters.isSocketChatListenersAttached;
    }
  },

  methods: {
    selectRoom(room) {
      this.selectedRoom = room;
    },

    getSenderName(message) {
      const user = this.selectedRoom.userDTOs.find(u => u.id === message.senderId);
      return user ? user.username : 'Unknown User';
    },

    isNewMessage(messageId) {
      return !this.processedMessageIds.includes(messageId);
    },

    attachSocketListeners() {
      if (this.isSocketListenersAttachedFromStore) {
        console.log("Les écouteurs de socket sont déjà attachés.");
        return;
      }
      console.log("Attachement des écouteurs de socket.");
      this.socketChat.on('emitRooms', this.updateRooms);
      this.socketChat.on('sendMessage', this.addMessageToRoom);
      this.$store.commit('SET_SOCKET_CHAT_LISTENERS_ATTACHED', true);
    },

    detachSocketListeners() {
      if (!this.isSocketListenersAttachedFromStore) {
        console.log("Les écouteurs de socket n'ont jamais été attachés.");
        return;
      }
      console.log("Détachement des écouteurs de socket.");
      this.socketChat.off('emitRooms', this.updateRooms);
      this.socketChat.off('sendMessage', this.addMessageToRoom);
      this.processedMessageIds = []; // Réinitialiser les IDs de messages traités
      this.$store.commit('SET_SOCKET_CHAT_LISTENERS_ATTACHED', false);
    },

    updateRooms(rooms) {
      this.rooms = rooms;
      console.log("Rooms updated with new data:", rooms);
    },

    addMessageToRoom(newMessage, senderDetails) {
      if (!this.isNewMessage(newMessage.id)) return;

      this.processedMessageIds.push(newMessage.id);
      const room = this.rooms.find(r => r.roomName === newMessage.room.roomName);
      if (room) {
        newMessage.senderUsername = senderDetails.senderUsername;
        room.messages.push(newMessage);
      }
    }
  },

  created() {
    if (!this.socketChat) {
      console.error("Socket Chat not initialized!");
      return;
    }
    this.socketChat.emit('Connection');
    this.attachSocketListeners();
  },

  beforeDestroy() {
    this.detachSocketListeners();
  },

  // Si vous utilisez Vue Router
  beforeRouteLeave(to, from, next) {
    this.detachSocketListeners();
    next();
  },

  // Si votre composant est à l'intérieur d'un <keep-alive>
  activated() {
    this.attachSocketListeners();
  },

  deactivated() {
    this.detachSocketListeners();
  }
};
</script>

<style scoped>
.dm-container {
  display: flex;
}

.rooms-list {
  width: 250px;
  overflow-y: auto;
  border-right: 1px solid #2fe8ee;
}

.vertical-separator {
  width: 1px;
  background-color: #2fe8ee;
  height: 100%;
}

.selected-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chat-name {
  color: #2fe8ee;
  cursor: pointer;
  transition: color 0.3s;
}

.chat-name:hover {
  color: black;
}
</style>

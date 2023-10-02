<template>
  <div class="dm-container">
    <!-- Room List -->
    <div v-if="rooms.length" class="rooms-list">
      <div v-for="room in rooms" :key="room.id" 
           @click="selectRoom(room)" 
           :class="{ active: selectedRoom === room }">
        <span class="chat-name">{{ room.roomName }}</span>
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

export default {
  components: { SendChat },

  data() {
    return {
      rooms: [],
      selectedRoom: null,
      processedMessageIds: [],
      isAttached: false,    // Drapeau pour l'attachement des écouteurs
      isDetached: false     // Drapeau pour le détachement des écouteurs
    };
  },

  computed: {
    socketChat() {
      return this.$store.getters.socketChat;
    }
  },

  methods: {
    // UI Handlers
    selectRoom(room) {
      this.selectedRoom = room;
    },
    
    // Message and User Utilities
    getSenderName(message) {
      const user = this.selectedRoom.userDTOs.find(u => u.id === message.senderId);
      return user ? user.username : 'Unknown User';
    },

    isNewMessage(messageId) {
      return !this.processedMessageIds.includes(messageId);
    },

    // Socket Listeners
    attachSocketListeners() {
      if (this.isAttached || this.isDetached) {
        console.log("Les écouteurs de socket sont déjà attachés ou le composant vient d'être créé.");
        return;
      }
      console.log("Attachement des écouteurs de socket.");
      this.socketChat.on('emitRooms', this.updateRooms);
      this.socketChat.on('sendMessage', this.addMessageToRoom);
      this.isAttached = true;
      this.isDetached = false;
    },
    
    detachSocketListeners() {
      if (!this.isDetached || !this.isAttached) {
        console.log("Les écouteurs de socket sont déjà détachés ou n'ont jamais été attachés.");
        return;
      }
      console.log("Détachement des écouteurs de socket.");
      this.socketChat.off('emitRooms', this.updateRooms);
      this.socketChat.off('sendMessage', this.addMessageToRoom);
      this.isAttached = false;
      this.isDetached = true;
    },
    
    // Socket Handlers
    updateRooms(rooms) {
      console.log("Mise à jour des rooms avec les nouvelles données:", rooms);
      this.rooms = rooms;
      console.log("Visualication des msg enregistre", rooms);
    },
    
    addMessageToRoom(newMessage, senderDetails) {
      console.log("Réception d'un nouveau message:", newMessage);
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
    console.log("Composant créé. Mise en place des écouteurs de socket si nécessaire.");
    if (!this.socketChat) {
      console.error("Socket Chat non initialized!");
      return;
    }
    this.socketChat.emit('Connection');
    if (!this.isAttached) {
      this.attachSocketListeners();
    }
  },
  
  beforeDestroy() {
    if (!this.isDetached) {
      this.detachSocketListeners();
    }
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

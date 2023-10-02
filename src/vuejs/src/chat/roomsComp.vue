<template>
  <div class="dm-container">
    <!-- Liste des rooms -->
    <div v-if="rooms.length > 0" class="rooms-list">
      <div v-for="room in rooms" :key="room.id" 
           @click="selectRoom(room)" 
           :class="{ active: selectedRoom === room }">
        <span class="chat-name">{{ room.roomName }}</span>
      </div>
    </div>

    <!-- Séparateur vertical -->
    <div class="vertical-separator"></div>

    <!-- Fenêtre de chat sélectionnée -->
    <div v-if="selectedRoom" class="selected-chat">
      <h3>{{ selectedRoom.roomName }}</h3>
      <ul>
        <li v-for="message in selectedRoom.messages" :key="message.id">
          {{ findUserNameById(message.senderId, selectedRoom.userDTOs) }}: {{ message.text }}
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
    };
  },

  computed: {
    socketChat() {
      return this.$store.getters.socketChat;
    }
  },

  methods: {
    selectRoom(room) {
      this.selectedRoom = room;
    },

    findUserNameById(userId, users) {
      const user = users.find(u => u.id === userId);
      return user ? user.username : 'Unknown User';
    },

    handleNewMessage(newMessage, senderDetails) {
      const room = this.rooms.find(r => r.roomName === newMessage.room.roomName);
      if (room) {
        newMessage.senderUsername = senderDetails.senderUsername;
        room.messages.push(newMessage);
      }
    }
  },

  created() {
    this.socketChat.emit('Connection');

    if (this.socketChat) {
      this.socketChat.on('emitRooms', (rooms) => {
        console.log("Mes rooms dispo:", rooms);
        this.rooms = rooms;
      });

      this.socketChat.on('sendMessage', (newMessage, senderDetails) => {
        this.handleNewMessage(newMessage, senderDetails);
      });
    } else {
      console.error("Socket Chat non initialisé!");
    }
  },

  beforeDestroy() {
    if (this.socketChat) {
      this.socketChat.off('emitRooms');
      this.socketChat.off('sendMessage');
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

<template>
  <div class="dm-container" v-cloak>
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
    <div v-if="selectedRoom" class="chat-window">
      <h3 class="chat-header">
        <span class="chat-name">{{ selectedRoom.roomName }}</span>
        <see-setting :room="selectedRoom"></see-setting>
      </h3>
      <div class="messages" v-if="selectedRoom.messages.length > 0" ref="messagesContainer">
        <div v-for="message in selectedRoom.messages" :key="message.id">
          <span>{{ getSenderName(message) }}: {{ getMessageText(message) }}</span>
        </div>
      </div>
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
      listenersAttached: false,
      usersInRoom: [],
      blockedUsers: []
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
      if (this.socketChat) {
        this.socketChat.emit('emitUsersInRoom', { channelName: room.roomName });
      }
    },

    getSenderName(message) {
      const user = this.usersInRoom.find(u => u.id === message.senderId);
      return user ? user.username : 'Unknown User';
    },
    updateBlockedUsers(users) {
        this.blockedUsers = users;
    },

    isNewMessage(messageId) {
      return !this.processedMessageIds.includes(messageId);
    },
    getMessageText(message) {
        const isBlocked = this.blockedUsers.some(user => user.id === message.senderId);
        return isBlocked ? "message bloqué" : message.text;
    },

    updateRooms(rooms) {
      this.rooms = rooms;
      this.$nextTick(() => {
        const previouslySelectedRoomName = this.selectedRoom ? this.selectedRoom.roomName : null;
        if (previouslySelectedRoomName) {
          this.selectedRoom = this.rooms.find(r => r.roomName === previouslySelectedRoomName);
        }
      });
    },

    addMessageToRoom() {
      this.socketChat.emit('emitRooms');
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

  mounted() {
    if (!this.socketChat) {
      console.error("Socket Chat not initialized!");
      return;
    }

    this.socketChat.emit('emitBlockedIds');
    this.socketChat.on('emitBlockedIds', this.updateBlockedUsers);
    this.socketChat.emit('emitRooms');
    this.socketChat.on('emitRooms', this.updateRooms);
    this.socketChat.on('usersDataInRoom', (users) => {
      this.usersInRoom = users;
    });
    this.socketChat.on('sendMessage', this.addMessageToRoom);
    this.listenersAttached = true;
  },

  beforeDestroy() {
    if (!this.socketChat) return;

    this.socketChat.off('emitRooms', this.updateRooms);
    this.socketChat.off('sendMessage', this.addMessageToRoom);
    this.socketChat.off('usersDataInRoom');
    this.processedMessageIds = [];
    this.listenersAttached = false;
    this.socketChat.off('emitBlockedIds', this.updateBlockedUsers);
  },

  watch: {
    'selectedRoom.messages': {
      immediate: true,
      handler() {
        this.scrollToBottom();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
[v-cloak] {
  display: none;
}

.dm-container {
  display: flex;
  height: 90vh;  /* 90% de la hauteur du navigateur */

}

.rooms-list {
  width: 250px;
  overflow-y: auto;
  border-right: 1px solid #2fe8ee;
  padding: 1rem;
}

.vertical-separator {
  width: 1px;
  background-color: #2fe8ee;
  height: 100%;
}

.chat-name {
  color: #2fe8ee;
  cursor: pointer;
  transition: color 0.3s;
  margin-bottom: 0.5rem;
}

.chat-name:hover {
  color: black;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
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

<template>
  <div class="dm-container">
    <div v-if="rooms.length > 0" class="rooms-list">
      <div v-for="room in rooms" :key="room.id" 
           @click="selectRoom(room)" 
           :class="{ active: selectedRoom === room }">
        <span class="chat-name">{{ room.roomName }}</span>
      </div>
    </div>
    <div class="vertical-separator"></div>
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
      processedMessageIds: []
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
      if (this.processedMessageIds.includes(newMessage.id)) return;
      this.processedMessageIds.push(newMessage.id);
      const room = this.rooms.find(r => r.roomName === newMessage.room.roomName);
      if (room) {
        newMessage.senderUsername = senderDetails.senderUsername;
        room.messages.push(newMessage);
      }
    },
    attachSocketListeners() {
      this.socketChat.on('emitRooms', this.updateRooms);
      this.socketChat.on('sendMessage', this.receiveMessage);
    },
    detachSocketListeners() {
      this.socketChat.off('emitRooms', this.updateRooms);
      this.socketChat.off('sendMessage', this.receiveMessage);
    },
    updateRooms(rooms) {
      this.rooms = rooms;
    },
    receiveMessage(newMessage, senderDetails) {
      this.handleNewMessage(newMessage, senderDetails);
    }
  },
  created() {
    if (!this.socketChat) {
      console.error("Socket Chat non initialisé!");
      return;
    }
    this.socketChat.emit('Connection');
    this.attachSocketListeners();
  },
  beforeDestroy() {
    this.detachSocketListeners();
  }
};
</script>

<style scoped>
/* ... (Votre code CSS actuel) */
</style>

<template>
  <div>
    <h2 v-if="rooms.length > 0">Chats disponibles</h2>
    <ul class="rooms-list">
      <li v-for="room in rooms" :key="room.id">
        <button @click="selectRoom(room)">
          {{ room.roomName }}
        </button>
      </li>
    </ul>

    <div v-if="selectedRoom" class="chat-window">
      <h3>{{ selectedRoom.roomName }}</h3>
      <ul>
        <li v-for="message in selectedRoom.messages" :key="message.id">
          {{ findUserNameById(message.sender, selectedRoom.userDTOs) }}: {{ message.content }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
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
    }
  },

  created() {
    this.socketChat.emit('Connection');

    if (this.socketChat) {
      this.socketChat.on('emitRooms', (rooms) => {
        console.log("Mes rooms dispo:", rooms);
        this.rooms = rooms;
      });
    } else {
      console.error("Socket Chat non initialisé!");
    }
  },

  beforeDestroy() {
    if (this.socketChat) {
      this.socketChat.off('emitRooms');
    }
  }
};
</script>

<template>
  <div>
    <h2>Public Rooms</h2>
    <ul>
      <li v-for="room in rooms" :key="room.id">
        <JoinRoom :room="room" />
      </li>
    </ul>
  </div>
</template>

<script>
import JoinRoom from "./joinRoom.vue";

export default {
  components: {
    JoinRoom
  },
  
  data() {
    return {
      rooms: []
    };
  },

  computed: {
    socketChat() {
      return this.$store.getters.socketChat;
    }
  },

  created() {
    this.socketChat.emit('Connection');

    if (this.socketChat) {
      this.socketChat.on('emitRooms', (rooms) => {
        console.log("Liste des rooms public:", rooms);
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

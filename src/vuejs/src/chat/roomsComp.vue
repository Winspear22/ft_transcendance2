<template>
  <div>
    <h2>My Rooms</h2>
    <ul>
      <li v-for="(room, index) in rooms" :key="room.id">
        <QuitRoom :room="room" :index="index" />
      </li>
    </ul>
  </div>
</template>

<script>
import QuitRoom from './quitRoom.vue'; 

export default {
  components: {
    QuitRoom
  },
  
  data() {
    return {
      rooms: [],
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

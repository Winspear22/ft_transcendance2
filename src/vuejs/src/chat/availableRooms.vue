<template>
    <div>
        <h2>My Rooms</h2>
        <ul>
            <li v-for="room in availableRooms" :key="room.id">{{ room.name }}</li>
        </ul>
    </div>
</template>

<script>
export default {
  name: "AvailableRoomsComponent",
  
  data() {
    return {
      availableRooms: []
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
      this.socketChat.on('emitAvailableRooms', (rooms) => {
        console.log("Liste des rooms auxquelles j'ai accès:", rooms);
        this.availableRooms = rooms;
      });
    } else {
      console.error("Socket Chat non initialisé!");
    }
  },

  beforeDestroy() {
    if (this.socketChat) {
      this.socketChat.off('emitAvailableRooms');
    }
  }
};
</script>
<template>
    <div>
      <h2 v-if="availableRooms.length > 0">Salles disponibles :</h2>
  
      <div class="tabs" v-if="availableRooms.length > 0">
        <div 
          v-for="(room, index) in availableRooms" 
          :key="index"
        >
          {{ room.channelName }}
        </div>
      </div>
    </div>
</template>
  
<script>
export default {
  data() {
    return {
      availableRooms: [],
    };
  },
  computed: {
    socketChat() {
      return this.$store.getters.socketChat;  // Assurez-vous que cette logique récupère le bon objet socket.
    }
  },
  methods: {
    fetchAvailableRooms() {
      console.log("je suis dans fetchAvailableRoom");
      this.socketChat.emit('emitAvailableRooms');  // Envoie l'événement pour obtenir les salles disponibles
      this.socketChat.on('emitAvailableRooms', (rooms) => {  // Attend la réponse du serveur
        console.log("Rooms received:", rooms);
        this.availableRooms = rooms;
      });
    }
  },
  mounted() {
    if (!this.socketChat) {
       console.error("Socket connection is not established");
       return;
    }
    console.log("Component mounted");
    this.fetchAvailableRooms();
  },
  beforeDestroy() {
    if (this.socketChat) {
      this.socketChat.off('emitAvailableRooms');
    }
  }
}
</script>
  
<style>
.tabs > div {
  cursor: pointer;
  padding: 10px;
  display: inline-block;
  margin-right: 10px;
}
</style>

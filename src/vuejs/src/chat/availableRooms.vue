<template>
  <div>
    <h2>My Rooms</h2>
    <div class="tabs">
      <QuitRoom 
        v-for="(room, index) in availableRooms" 
        :key="index" 
        :room="room" 
        :isActive="isActiveRoom(index)"
        :index="index"
        @select="switchRoom" />
    </div>
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
      availableRooms: [],
      activeRoomIndex: null  
    };
  },

  computed: {
    socketChat() {
      return this.$store.getters.socketChat;
    }
  },

  methods: {
    switchRoom(index) {
      this.activeRoomIndex = index;
      this.socketChat.emit('switchRoom', this.availableRooms[index].channelName); 
    },
    
    isActiveRoom(index) {
      return this.activeRoomIndex === index;
    }
  },

  created() {
    this.socketChat.emit('Connection');

    if (this.socketChat) {
      this.socketChat.on('emitAvailableRooms', (rooms) => {
        this.availableRooms = rooms.channels;  
        console.log("Liste des rooms auxquelles j'ai accès:", rooms.channels);
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

<style>
.tabs > div {
  cursor: pointer;
  padding: 10px;
  display: inline-block;
  margin-right: 10px;
}

.tabs > div.active {
  font-weight: bold;
  border-bottom: 2px solid blue;
}
</style>

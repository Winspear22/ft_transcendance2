<template>
    <div>
      <h2 v-if="availableRooms.length > 0">Salles disponibles :</h2>

      <div v-if="availableRooms.length > 0">
        <div 
          v-for="(room, index) in availableRooms" 
          :key="index"
        >
          {{ room.channelName }}
          <joinRoom :room="room" />
        </div>
      </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import joinRoom from './joinRoom';

export default {
  components: { joinRoom },
  data() {
    return {
      availableRooms: [],
    };
  },
  computed: {
    ...mapGetters(['socketChat'])
  },
  methods: {
    fetchAvailableRooms() {
      this.socketChat.emit('emitAvailableRooms');  
      this.socketChat.on('emitAvailableRooms', (response) => {
        if (response.success && response.channels) {
            this.availableRooms = response.channels;
            console.log("this.socketChat.id ", this.socketChat.id)
            console.log("availableRooms ", this.availableRooms);
        }
     });
    }
  },
  mounted() {
    if (!this.socketChat) {
      console.error("Socket connection is not established");
      return;
    }
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

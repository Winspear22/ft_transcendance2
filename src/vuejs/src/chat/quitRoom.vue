<template>
    <div @click.stop="selectRoom" :class="{ active: isActive }">
      {{ room.roomName }}
      <button @click.stop="quitCurrentRoom" class="quit-button">✖</button>
      <NotificationPopup v-if="notification" :message="notification" />
    </div>
</template>
  
<script>
import NotificationPopup from './notificationPopup.vue'; 

export default {
  components: {
    NotificationPopup  // Ajout de cette ligne
  },
  data() {
    return {
      notification: null
    };
  },
  props: {
    room: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    socketChat() {
      return this.$store.getters.socketChat;
    }
  },
  methods: {
    selectRoom() {
      this.$emit('select', this.index);
    },
    quitCurrentRoom() {
      this.socketChat.emit('quitRoom', { channelName: this.room.roomName });
    }
  },
  created() {
    this.socketChat.on('quitRoom', (message) => {
      this.notification = message;
      setTimeout(() => {
        this.notification = null;
      }, 5100); // S'assurer que le message est effacé après que la popup ait disparu
    });
  },
  beforeDestroy() {
    this.socketChat.off('quitRoom');
  }
};
</script>

<style>
.quit-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-left: 10px;
}
</style>

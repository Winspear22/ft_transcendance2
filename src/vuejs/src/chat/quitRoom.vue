<template>
  <div v-if="visible" class="room-modal">
    <div class="room-container">
      {{ room.roomName }}
      <button @click.stop="quitCurrentRoom" class="quit-button">✖</button>
      <NotificationPopup v-if="notification" :message="notification" />
      <button @click="closeModal">Fermer</button>
    </div>
  </div>
</template>

<script>
import NotificationPopup from './notificationPopup.vue'; 

export default {
components: {
  NotificationPopup
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
  },
  visible: {  // Nouvelle propriété pour gérer la visibilité
    type: Boolean,
    default: false
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
  },
  closeModal() {
    this.$emit('close');  // Émettre un événement de fermeture
  }
},
created() {
  this.socketChat.on('quitRoom', (message) => {
    this.notification = message;
    setTimeout(() => {
      this.notification = null;
    }, 5100);
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

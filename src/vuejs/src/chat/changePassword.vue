<template>
  <div v-if="visible" class="modal">
    <!-- Change Password Container -->
    <div class="modal-content">
      <h3>Changer le mot de passe</h3>
      <input v-model="password" placeholder="Nouveau mot de passe" />
      <button @click="submitChange">Confirmer</button>
      <button @click="closeModal">Fermer</button>
    </div>

    <!-- Utilisez le composant NotificationModal -->
    <NotificationModal :visible="showNotificationPopup" :message="notificationMessage" />
  </div>
</template>

<script>
import NotificationModal from './NotificationModal.vue';  // Assurez-vous que le chemin est correct

export default {
  components: {
    NotificationModal
  },
    props: ['visible', 'channelName'],

    data() {
        return {
            password: '',
            notificationMessage: '',    
            showNotificationPopup: false    
        };
    },

    computed: {
      socketChat() {
        return this.$store.getters.socketChat;
      }
    },

    mounted() {
      this.addSocketListeners();
    },

    beforeDestroy() {
      this.removeSocketListeners();
    },

    methods: {
      addSocketListeners() {
        this.socketChat.on('changeRoomPassword', this.handlePasswordChangeNotification);
      },

      removeSocketListeners() {
        this.socketChat.off('changeRoomPassword', this.handlePasswordChangeNotification);
      },

      handlePasswordChangeNotification(message) {
        this.notificationMessage = message;
        this.showNotificationPopup = true;
        setTimeout(() => {
          this.showNotificationPopup = false;
        }, 5000);
    },


      submitChange() {
        if (!this.socketChat) {
          console.error("Socket Chat not initialized!");
          return;
        }
        this.socketChat.emit('changeRoomPassword', {
          channelName: this.channelName,
          password: this.password
        });
        this.closeModal();
      },
      
      closeModal() {
        this.$emit('close');
      }
    },
}
</script>

<style scoped>
.modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.modal-content {
    background-color: #2459d5;
    padding: 20px;
    border-radius: 8px;
    width: 50%;
    max-width: 400px;
    z-index: 1000;
    position: relative;
    color: #2fe8ee;
}

button {
    cursor: pointer;
    background-color: transparent;
    color: #2fe8ee;
    border: none;
    margin-right: 10px;
    transition: color 0.3s;
}

button:hover {
    color: black;
}

.notification-change {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 15px;
    background-color: red;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    z-index: 9999;
}
</style>

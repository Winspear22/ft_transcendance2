<template>
    <div v-if="visible" class="modal">
      <!-- Change Password Container -->
      <div class="change-password-container">
        <h3>Changer le mot de passe</h3>
        <input v-model="password" placeholder="Nouveau mot de passe" />
        <button @click="submitChange">Confirmer</button>
        <button @click="closeModal">Fermer</button>
      </div>
      
      <!-- Notification Popup -->
      <div v-if="showNotificationPopup" class="notification-change">
        {{ notificationMessage }}
      </div>
    </div>
</template>

<script>
export default {
    props: ['visible', 'channelName'],

    data() {
        return {
            password: '',
            notificationMessage: '',    // Message for the notification popup
            showNotificationPopup: false    // Control display of notification popup
        };
    },

    computed: {
      socketChat() {
        return this.$store.getters.socketChat;
      }
    },

    mounted() {
        this.socketChat.on('changeRoomPassword', (message) => {
            this.notificationMessage = message;
            this.showNotificationPopup = true;
            setTimeout(() => {
                this.showNotificationPopup = false;
            }, 5000);
        });
    },

    methods: {
      // ####################
      // MAIN METHODS
      // ####################

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
    }
}
</script>

<style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .change-password-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    width: 300px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .notification-change {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 15px;
    background-color: #ffdd57;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    z-index: 1100;
  }
</style>

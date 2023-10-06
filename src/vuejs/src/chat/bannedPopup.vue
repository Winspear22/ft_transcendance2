<template>
  <div v-if="showPopup" class="banned-popup">
    <div class="popup-content">
      <p>{{ bannedMessage }}</p>
      <button @click="handleOkClick">OK</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
data() {
  return {
    showPopup: false,
    bannedMessage: '',
    isBanned: false
  };
},

computed: {
  ...mapGetters(['socketChat'])
},

mounted() {
  this.socketChat.on('banned', this.handleBanned);
  this.socketChat.on('kicked', this.handleBanned);

  this.socketChat.on('unbanned', this.handleUnbanned);
  this.socketChat.on('muted', this.handleUnbanned);
},

beforeDestroy() {
  this.socketChat.off('banned', this.handleBanned);
  this.socketChat.off('kicked', this.handleBanned);

  this.socketChat.off('unbanned', this.handleUnbanned);
  this.socketChat.off('muted', this.handleUnbanned);
},

methods: {
  handleBanned(data) {
    this.bannedMessage = data.message;
    this.showPopup = true;
    this.isBanned = true;
  },

  handleUnbanned(data) {
    this.bannedMessage = data.message;
    this.showPopup = true;
    this.isBanned = false;
  },

  handleOkClick() {
    this.showPopup = false;
    if(this.isBanned) {
      this.redirectToHome();
    }
  },

  redirectToHome() {
    this.$router.push({ name: 'Home' });
  }
}
}
</script>

  
  <style scoped>
  .banned-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  .popup-content {
      background: linear-gradient(#2fe8ee, #2459d5);
      color: white;
      padding: 20px;
      border-radius: 10px;
      width: 70%;
      max-width: 500px;
      text-align: center;
  }
  
  .popup-content h3 {
      color: #2fe8ee;
      transition: color 0.3s;
  }
  
  .popup-content h3:hover {
      color: black;
  }
  
  .popup-content button {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: transparent;
      color: #2fe8ee;
      border: 1px solid #2fe8ee;
      border-radius: 5px;
      transition: background-color 0.3s, color 0.3s;
  }
  
  .popup-content button:hover {
      background-color: #2fe8ee; 
      color: black; 
  }
  </style>
  
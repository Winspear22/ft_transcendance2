<template>
  <div class="join-room-container">
    <input v-if="room.hasPassword" v-model="password" placeholder="Password (if any)" class="password-input" />
    <button @click="attemptJoin">✔</button>
  </div>
</template>
  
  
    <script>
    export default {
      props: {
        room: {
          type: Object,
          required: true
        }
      },
  
      data() {
        return {
          password: ""
        };
      },
  
      computed: {
        socketChat() {
          return this.$store.getters.socketChat;
        }
      },
  
      methods: {
        attemptJoin() {
          this.socketChat.emit('joinRoom', {
            channelName: this.room.channelName,
            password: this.password
          });
        }
      }
    };
    </script>
  
  <style>
  .join-room-container {
    text-align: center;
    display: inline-flex;  
    align-items: center;  
  }
  
  .password-input {
    background-color: transparent;
    color: #2fe8ee;
    border: 1px solid #2fe8ee; 
    margin-right: 10px; 
    outline: none; 
  }
  
  .password-input::placeholder {  
    color: #2fe8ee;
    opacity: 0.7; 
  }
  
  button {
    background-color: transparent;
    color: #2fe8ee;
    border: none;
    transition: color 0.3s;
  }
  
  button:hover {
    color: black;
  }
  </style>
<template>
    <div>
      {{ room.roomName }}
      <input v-model="password" placeholder="Password (if any)" />
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
          channelName: this.room.roomName,
          password: this.password
        });
      }
    }
  };
  </script>
  
  <style>
  </style>
  
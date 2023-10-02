<template>
  <div>
    {{ room.channelName }}
    <input v-if="room.hasPassword" v-model="password" placeholder="Password (if any)" />
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
  </style>
  
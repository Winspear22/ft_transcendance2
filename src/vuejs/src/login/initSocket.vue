<template>
    <div></div>
</template>

<script>
import io from 'socket.io-client';
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {};
  },

  computed: {
    ...mapGetters(['accessToken'])
  },

  methods: {
    ...mapActions(['setsocketDm']),
    ...mapActions(['setsocketChat'])
  },

  mounted() {
    const cookie = this.accessToken;
    
    if (!cookie) {
      console.error("Token non disponible !");
      return;
    }

    const socketDm = io('http://localhost:3000/dms', {
      query: {
        Cookie: cookie
      }
    });
    const socketChat = io('http://localhost:3000/chats', {
      query: {
        Cookie: cookie
      }
    });

    this.setsocketDm(socketDm);
    this.setsocketChat(socketChat);

    socketDm.on('Connection', () => {});
    socketChat.on('Connection', () => {});
    },

    beforeDestroy() {
      if (this.$store.state.socketDm) {
        this.$store.state.socketDm.disconnect();
      }
      if (this.$store.state.socketChat) {
        this.$store.state.socketChat.disconnect();
      }
    }
  };
</script>

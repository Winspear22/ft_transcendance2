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
    ...mapActions(['setsocketDm', 'setsocketChat', 'setGameSocket'])
  },

  mounted() {
    const cookie = this.accessToken;
    
    if (!cookie) {
      console.error("Token non disponible !");
      return;
    }

    const socketDm = io('http://localhost:3000/dms', { query: { Cookie: cookie }});
    const socketChat = io('http://localhost:3000/chats', { query: { Cookie: cookie }});
    const gameSocket = io('http://localhost:3000/game', { query: { Cookie: cookie }});

    this.setsocketDm(socketDm);
    this.setsocketChat(socketChat);
    this.setGameSocket(gameSocket);

    socketDm.on('connect', () => { console.log('Connected to DM socket'); });
    socketChat.on('connect', () => { console.log('Connected to Chat socket'); });
    gameSocket.on('connect', () => { console.log('Connected to Game socket'); });

    // Gestion des erreurs de connexion
    socketDm.on('connect_error', (error) => { console.error('DM socket connection error:', error); });
    socketChat.on('connect_error', (error) => { console.error('Chat socket connection error:', error); });
    gameSocket.on('connect_error', (error) => { console.error('Game socket connection error:', error); });
  },

  beforeDestroy() {
    if (this.$store.state.socketDm) {
      this.$store.state.socketDm.disconnect();
    }
    if (this.$store.state.socketChat) {
      this.$store.state.socketChat.disconnect();
    }
    if (this.$store.state.gameSocket) {
      this.$store.state.gameSocket.disconnect();
    }
  }
};
</script>


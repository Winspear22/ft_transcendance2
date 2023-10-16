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
  ...mapActions(['setsocketDm', 'setsocketChat', 'setGameSocket', 'disconnectAllSockets'])
},

mounted() {
  const cookie = this.accessToken;
  
  if (!cookie) {
    console.error("Token non disponible !");
    return;
  }

  const socketDm = io(process.env.VUE_APP_HOSTNAME + '/dms', { query: { Cookie: cookie }});
  const socketChat = io(process.env.VUE_APP_HOSTNAME + '/chats', { query: { Cookie: cookie }});
  const gameSocket = io(process.env.VUE_APP_HOSTNAME + '/game', { query: { Cookie: cookie }});

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
    this.disconnectAllSockets();
  }
};
</script>
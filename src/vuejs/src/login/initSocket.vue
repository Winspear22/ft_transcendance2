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
    ...mapActions(['setSocket'])
  },

  mounted() {
    const cookie = this.accessToken;
    
    if (!cookie) {
      console.error("Token non disponible !");
      return;
    }

    const socket = io('http://localhost:3000/dms', {
      query: {
        Cookie: cookie
      }
    });

    this.setSocket(socket);

    socket.on('Connection', () => {});
    },

  beforeDestroy() {
    if (this.$store.state.socket) {
      this.$store.state.socket.disconnect();
    }
  }
};
</script>

<template>
  <div>
    <!-- UI Elements Section -->
    <!-- Consider adding a modal or other UI elements here if needed -->
    <button @click="confirmQuit">Confirmer la sortie</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  props: ['channelName'],

  data() {
    return {
      router: useRouter()
    };
  },

  computed: {
    ...mapGetters(['socketChat'])
  },

  mounted() {
    this.initializeSocketEvents();
  },

  methods: {
    // ####################
    // MAIN METHODS
    // ####################

    confirmQuit() {
      if (!this.socketChat) {
        console.error("SocketChat n'est pas défini.");
        return;
      }

      try {
        this.socketChat.emit('quitRoom', { channelName: this.channelName });
      } catch (error) {
        console.error("Erreur lors de la confirmation de sortie:", error);
      }
    },

    // ####################
    // HELPER METHODS
    // ####################

    initializeSocketEvents() {
      if (!this.socketChat) {
        console.error("SocketChat n'est pas défini.");
        return;
      }

      this.socketChat.on('quitRoom', message => {
        console.log("quit room message =", message);
        alert(message);
        this.$emit('close');
        this.router.push('/home');
      });
    }
  }
}
</script>
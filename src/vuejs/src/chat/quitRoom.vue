<template>
  <div>
    <!-- Vous pouvez ajouter un modal ou d'autres éléments d'interface utilisateur ici -->
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
    if (this.socketChat) {
      this.socketChat.on('quitRoom', message => {
        console.log("quit room message =", message);
        alert(message);
        this.$emit('close');
        this.router.push('/home');
      });
    } else {
      console.error("SocketChat n'est pas défini.");
    }
  },
  methods: {
    confirmQuit() {
      if (this.socketChat) {
        try {
          this.socketChat.emit('quitRoom', { channelName: this.channelName });
        } catch (error) {
          console.error("Erreur lors de la confirmation de sortie:", error);
        }
      } else {
        console.error("SocketChat n'est pas défini.");
      }
    }
  }
}
</script>


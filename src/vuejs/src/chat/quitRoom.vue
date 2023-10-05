<template>
  <div>
    <!-- Modal de confirmation -->
    <div v-if="showConfirmModal" class="modal">
      <div class="modal-content">
        <h3>Confirmation</h3>
        <p>Voulez-vous vraiment quitter la salle {{ channelName }} ?</p>
        <button @click="handleQuitRoom">Confirmer</button>
        <button @click="closeConfirmModal">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['channelName'],

  data() {
    return {
      showConfirmModal: true
    };
  },

  computed: {
    ...mapGetters(['socketChat'])
  },

  methods: {
    handleQuitRoom() {
      this.showConfirmModal = false;
      if (!this.socketChat) {
        console.error("SocketChat n'est pas défini.");
        return;
      }
      try {
        this.socketChat.emit('quitRoom', { channelName: this.channelName });
        this.$emit('close');
        this.$router.push('/home');
      } catch (error) {
        console.error("Erreur lors de la confirmation de sortie:", error);
      }
    },

    closeConfirmModal() {
      this.showConfirmModal = false;
    }
  }
}
</script>

<style scoped>
.modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.modal-content {
    background-color: #2459d5;
    padding: 20px;
    border-radius: 8px;
    width: 50%;
    max-width: 400px;
    z-index: 1000;
    position: relative;
    color: #2fe8ee;
}

button {
    cursor: pointer;
    background-color: transparent;
    color: #2fe8ee;
    border: none;
    margin-right: 10px;
    transition: color 0.3s;
}

button:hover {
    color: black;
}
</style>

<template>
    <div class="unban-user-modal">
      <!-- Header Section -->
      <h3>Débannir un utilisateur</h3>

      <!-- User Input Section -->
      <label>
        Nom d'utilisateur :
        <input v-model="targetUsername" />
      </label>

      <!-- Action Buttons Section -->
      <button @click="unbanUser">Débannir</button>
      <button @click="closeModal">Fermer</button>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['channelName'],

    data() {
      return {
        targetUsername: '',
      };
    },

    computed: {
      ...mapGetters(['socketChat'])
    },

    methods: {
      // ####################
      // MAIN METHODS
      // ####################

      unbanUser() {
        if (!this.targetUsername.trim()) {
          alert('Veuillez entrer un nom d\'utilisateur valide à débannir.');
          return;
        }

        this.socketChat.emit('unbanUser', {
          channelName: this.channelName,
          targetUsername: this.targetUsername,
        });
        this.closeModal();
      },

      // ####################
      // UTILITY METHODS
      // ####################

      closeModal() {
        this.$emit('close');
      },
    }
}
</script>


<style scoped>
  /* Modal Styling */
  .unban-user-modal {
    width: 300px;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
  }

  /* Header Styling */
  .unban-user-modal h3 {
    margin-top: 0;
  }

  /* Label Styling */
  .unban-user-modal label {
    display: block;
    margin-bottom: 10px;
  }

  /* Input Styling */
  .unban-user-modal input {
    width: 100%;
    padding: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  /* Button Styling */
  .unban-user-modal button {
    padding: 5px 10px;
    border: none;
    background-color: #007bff;
    color: #fff;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .unban-user-modal button:hover {
    background-color: #0056b3;
  }

  .unban-user-modal button:last-child {
    margin-left: 10px;
    background-color: #ccc;
    color: #333;
  }

  .unban-user-modal button:last-child:hover {
    background-color: #aaa;
  }
</style>

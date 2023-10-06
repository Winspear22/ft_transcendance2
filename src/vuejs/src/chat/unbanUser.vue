<template>
  <div class="unban">
    <!-- Header Section -->
    <div class="unban-content">
      <h3>Débannir un utilisateur</h3>
      
      <!-- Message Display Section -->
      <p class="unban-message" v-if="unbanMessage">{{ unbanMessage }}</p>
      
      <!-- User Input Section -->
      <label>
        Nom d'utilisateur :
        <input v-model="targetUsername" />
      </label>

      <!-- Action Buttons Section -->
      <button @click="unbanUser">Débannir</button>
      <button @click="closeModal">Fermer</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['channelName'],

  data() {
    return {
      targetUsername: '',
      unbanMessage: ''
    };
  },

  computed: {
    ...mapGetters(['socketChat'])
  },

  mounted() {
    this.socketChat.on('unbanUser', this.handleUnbanResponse);
  },

  beforeDestroy() {
    this.socketChat.off('unbanUser', this.handleUnbanResponse);
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
    },

    handleUnbanResponse(data) {
      if (typeof data === "string" && data.includes("Error")) {
        this.unbanMessage = "Impossible de débannir cette personne";
      } else if (data.message && data.message.includes("successfully unbanned")) {
        this.unbanMessage = "Déban réussi";
      } else {
          this.unbanMessage = "Erreur inattendue";
      }
      setTimeout(this.closeModal, 2000);
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
.unban {
display: flex;
justify-content: center;
align-items: center;
position: fixed;
top: 0;
right: 0;
bottom: 0;
left: 0;
background-color: rgba(0,0,0,0.7);
}

.unban-content {
width: 300px;
padding: 20px;
background: linear-gradient(to left, #2fe8ee, #2459d5); 
border-radius: 5px;
box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

button {
margin-top: 10px;
padding: 5px 15px;
background-color: transparent;
border: 1px solid #2fe8ee;
color: #2fe8ee;
border-radius: 5px;
cursor: pointer;
transition: color 0.2s, background-color 0.2s;
}

button:hover {
background-color: #2fe8ee;
color: black;
}

.unban-message {
margin-top: 10px;
color: #2fe8ee;
font-weight: bold;
}

input {
margin-top: 10px;
padding: 5px 10px;
background-color: transparent;
border: 1px solid #2fe8ee;
border-radius: 5px;
color: #2fe8ee;
transition: background-color 0.2s, color 0.2s;
}

input:hover, input:focus {
background-color: #2fe8ee;
color: black;
}
</style>

<template>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <!-- Contenu de la modal -->
        <input v-model="invitedUsername" placeholder="Nom d'utilisateur à inviter">
        <button @click="sendInvite">Inviter à la salle</button>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex';
  
  export default {
    props: ['channelName'],
    data() {
      return {
        invitedUsername: '',
        showModal: true  // Par défaut, la modal est affichée. Vous pouvez la changer selon vos besoins.
      };
    },
    computed: {
      ...mapGetters(['socketChat'])
    },
    methods: {
        closeModal() {
            this.showModal = false;
            this.$emit('close');  // Émettre un événement pour signaler que la modal est fermée
        },
      sendInvite() {
        if (this.socketChat) {
          try {
            this.socketChat.emit('inviteRoom', { channelName: this.channelName, invitedUsernames: this.invitedUsername });
            this.socketChat.on('inviteRoom', message => {
              alert(message);
            });
          } catch (error) {
            console.error("Erreur lors de l'envoi de l'invitation:", error);
          }
        } else {
          console.error("SocketChat n'est pas défini.");
        }
      }
    }
  }
  </script>
  
  <style scoped>
  /* Votre style ici si nécessaire */
  </style>
  
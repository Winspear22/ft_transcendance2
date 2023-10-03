<template>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <!-- Contenu de la modal -->
        <h2>Inviter un utilisateur à {{ channelName }}</h2>
        <input v-model="invitedUsername" placeholder="Nom d'utilisateur à inviter">
        <button @click="sendInvite">Inviter</button>
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
        showModal: true
      };
    },
    computed: {
      ...mapGetters(['socketChat'])
    },
    methods: {
        // Fermer la modal
        closeModal() {
            this.showModal = false;
            this.$emit('close');
        },
        // Envoyer l'invitation
        sendInvite() {
            if (!this.socketChat) {
                console.error("SocketChat n'est pas défini.");
                return;
            }

            try {
                this.socketChat.emit('inviteRoom', { 
                    channelName: this.channelName, 
                    invitedUsernames: this.invitedUsername 
                });
                
                this.socketChat.on('inviteRoom', message => {
                    alert(message);
                });
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'invitation:", error);
            }
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
    background-color: rgba(0,0,0,0.7);
}

.modal-content {
    width: 300px;
    padding: 20px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.close {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
}

button {
    margin-top: 10px;
    padding: 5px 15px;
    background-color: #4CAF50;
    border: none;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #45a049;
}
</style>
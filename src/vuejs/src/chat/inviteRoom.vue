<template>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <!-- Contenu de la modal -->
        <h2>Inviter un utilisateur à {{ channelName }}</h2>
        <input v-model="invitedUsername" placeholder="Nom d'utilisateur à inviter">
        <button @click="sendInvite">Inviter</button>
        <button @click="closeModal" class="exit-btn">Quitter</button>
        <p v-if="inviteMessage" class="invite-message">{{ inviteMessage }}</p>
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
            showModal: true,
            inviteMessage: null
        };
    },
    computed: {
        ...mapGetters(['socketChat'])
    },
    mounted() {
        this.socketChat.on('inviteRoom', this.handleInviteResponse);
    },
    beforeDestroy() {
        this.socketChat.off('inviteRoom', this.handleInviteResponse);
    },
    methods: {
        closeModal() {
            this.showModal = false;
            this.$emit('close');
        },
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
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'invitation:", error);
            }
        },
        handleInviteResponse(message) {
            let delayToClose = 1000; 
 
            if (message.includes("Invitation sent")) {
                this.inviteMessage = "Invitation envoyée";
                setTimeout(this.closeModal, delayToClose);
            } else {
                this.inviteMessage = "Impossible d'envoyer l'invitation " ;
                setTimeout(this.closeModal, delayToClose);
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
    background: linear-gradient(to left, #2fe8ee, #2459d5); 
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.close {
    position: absolute;
    right: 10px;
    top: 10px;
    background-color: transparent;
    border: none;
    color: #2fe8ee;
    cursor: pointer;
    font-size: 24px;
}

.close:hover {
    color: black;
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

.invite-message {
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
.exit-btn {
    margin-top: 10px;
    padding: 5px 15px;
    background-color: transparent;
    border: 1px solid #2fe8ee;
    color:  #2fe8ee;
    border-radius: 5px;
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;
}

.exit-btn:hover {
    background-color: #2fe8ee;
    color: black;
}
</style>

<template>
    <div>
        <!-- Bouton pour ouvrir la pop-up de création de salle -->
        <button @click="showModal = true">Créer une nouvelle salle</button>

        <!-- Pop-up de création de salle -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <span class="close-btn" @click="showModal = false">&times;</span>
                <h2>Créer une nouvelle salle</h2>
                <input v-model="channelName" placeholder="Channel Name" />
                <input type="checkbox" v-model="isPrivate" /> Chambre privée
                <input type="checkbox" v-model="hasPassword" /> Ajouter un mot de passe
                <input v-if="hasPassword" v-model="password" type="password" placeholder="Mot de passe" />
                <button @click="createRoom">Valider</button>
            </div>
        </div>

        <!-- Pop-up de notification -->
        <div v-if="showNotification" class="notification">
            {{ notification }}
        </div>
    </div>
</template>

<script>
import bcrypt from 'bcryptjs';

export default {
    data() {
        return {
            showModal: false,
            channelName: '',
            hasPassword: false,
            password: '',
            isPrivate: false,
            notification: '',
            showNotification: false,
            timer: null
        };
    },
    computed: {
        socketChat() {
            return this.$store.getters.socketChat;
        }
    },
    methods: {
        async createRoom() {
            if(!this.channelName || (this.hasPassword && !this.password)) {
                alert('Veuillez remplir tous les champs nécessaires.');
                return;
            }

            // Hashage du mot de passe avec bcrypt
            let hashedPassword = null;
            if (this.hasPassword) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(this.password, salt);
                console.log("MDP CRYPTE", hashedPassword);
            }

            const data = {
                channelName: this.channelName,
                hasPassword: this.hasPassword,
                password: this.hasPassword ? hashedPassword : undefined,
                isPrivate: this.isPrivate
            };

            const currentChannelName = this.channelName;

            this.socketChat.emit('createRoom', data);

            this.channelName = '';
            this.hasPassword = false;
            this.password = '';
            this.isPrivate = false;
            this.showModal = false;

            this.socketChat.once('createRoom', (message) => {
                if (message.startsWith("Channel created")) {
                    this.notification = `${currentChannelName} a été créé`;
                } else if (message.startsWith("Error. Channel")) {
                    this.notification = `${currentChannelName} n'a pas pu être crée`;
                }

                this.showNotification = true;
                this.timer = setTimeout(() => {
                    this.showNotification = false;
                    this.notification = '';
                }, 5000);
            });
        }
    },
    beforeDestroy() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}
</script>

<style>
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
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 50%;
    max-width: 400px;
    z-index: 1000;
}

.close-btn {
    cursor: pointer;
    position: absolute;
    right: 15px;
    top: 10px;
    font-size: 20px;
}

.notification {
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: #eee;
    border: 1px solid #333;
    z-index: 1001;
}
</style>
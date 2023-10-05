<template>
    <div>
        <!-- Bouton pour ouvrir la pop-up de création de salle -->
        <button @click="showModal = true">Créer une nouvelle salle</button>

        <!-- Pop-up de création de salle -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <button class="close-btn" @click="closeModal">&times;</button>
                <h2>Créer une nouvelle salle</h2>
                <input v-model="channelName" placeholder="Channel Name" />
                <input type="checkbox" v-model="isPrivate" /> Chambre privée
                <input type="checkbox" v-model="hasPassword" /> Créer un mdp
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

const CHANNEL_CREATED_PREFIX = "Channel created";

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
        closeModal() {
            this.showModal = false;
        },
        async hashPassword(password) {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        },
        async createRoom() {
            if (!this.isFormValid()) {
                alert('Veuillez remplir tous les champs nécessaires.');
                return;
            }

            const hashedPassword = this.hasPassword ? await this.hashPassword(this.password) : null;
            this.emitRoomCreation(hashedPassword);
            this.resetForm();
        },
        isFormValid() {
            return this.channelName && (!this.hasPassword || (this.hasPassword && this.password));
        },
        emitRoomCreation(hashedPassword) {
            const data = {
                channelName: this.channelName,
                hasPassword: this.hasPassword,
                password: this.hasPassword ? hashedPassword : undefined,
                isPrivate: this.isPrivate
            };

            const currentChannelName = this.channelName;
            this.socketChat.emit('createRoom', data);

            this.socketChat.once('createRoom', (message) => {
                if (message.startsWith(CHANNEL_CREATED_PREFIX)) {
                    this.notification = `${currentChannelName} a été créé`;
                } else
                    this.notification = `${currentChannelName} n'a pas pu être crée`;

                this.showNotificationPopup();
            });
        },
        showNotificationPopup() {
            this.showNotification = true;
            this.timer = setTimeout(() => {
                this.showNotification = false;
                this.notification = '';
            }, 5000);
        },
        resetForm() {
            this.channelName = '';
            this.hasPassword = false;
            this.password = '';
            this.isPrivate = false;
            this.showModal = false;
        }
    },
    beforeDestroy() {
        if (this.timer) {
            clearTimeout(this.timer);
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

.modal-content input[type="text"],
.modal-content input[type="password"],
.modal-content input[type="checkbox"] + label {
    color: #2fe8ee; 
}

.modal-content input[type="text"]::placeholder,
.modal-content input[type="password"]::placeholder {
    color: #2fe8ee;
}

.modal-content .close-btn {
    cursor: pointer;
    position: absolute;
    right: 15px;
    top: 10px;
    font-size: 20px;
    border: none;
    background: none;
    color: #2fe8ee;
}

.modal-content button {
    cursor: pointer; 
    background-color: transparent;
    color: #2fe8ee; 
    border: none; 
    display: block;
    margin-left: auto;
    margin-right: auto;
    transition: color 0.3s;
}

.modal-content button:hover {
    color: black; 
}

.close-btn {
    cursor: pointer;
    position: absolute;
    right: 15px;
    top: 10px;
    font-size: 20px;
    border: none;
    background: none;
}
.notification {
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: #2459d5;
    border: 1px solid #2fe8ee; 
    color: #2fe8ee; 
    z-index: 1001;
    transition: background-color 0.3s, color 0.3s; 
}

.notification:hover {
    background-color: #2fe8ee; 
    color: black; 
}

button {
    cursor: pointer; 
    background-color: transparent; 
    color: #2fe8ee; 
    border: none; 
    display: block; 
    margin-left: auto;
    margin-right: auto;
    transition: color 0.3s; 
}

button:hover {
    color: black; 
}
</style>
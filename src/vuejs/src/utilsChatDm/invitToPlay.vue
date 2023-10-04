<template>
    <div class="invite-play-container">
        <input class="invite-play-input" v-model="username" placeholder="Nom d'utilisateur" />
        <button class="invite-play-button" @click="sendPlayRequest">Inviter à jouer</button>
        <div v-if="popupMessage">{{ popupMessage }}</div>
    </div>
</template>


<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import router from '@/router';

export default {
    name: 'invitToPlay',
    setup() {
        const username = ref('');
        const popupMessage = ref('');
        const store = useStore();
        const socket = store.getters.gameSocket;

        onMounted(() => {
            socket.on('invitPlayRequestSuccess', message => {
                if (message.startsWith('Your')) {
                    popupMessage.value = message;
                }
            });
            socket.on('goToGame', () => {
                router.push('/game');
            })

            socket.on('invitPlayRequestError', message => {
                popupMessage.value = message;
            });
        });

        const sendPlayRequest = () => {
            if (socket) {
                socket.emit('invitPlayRequest', username.value);
            }
        }

        return {
            username,
            popupMessage,
            sendPlayRequest
        };
    }
};
</script>


<style scoped>
.invite-play-container {
    font-family: 'Arial', sans-serif;
}

.invite-play-input {
    background-color: transparent;
    border: none;
    padding: 10px;
    margin: 10px 0;
    color: #2fe8ee;
}

.invite-play-input:focus {
    outline: none;
    box-shadow: none;
}

.invite-play-button {
    background-color: transparent;
    color: #2fe8ee;
    border: none;
    cursor: pointer;
    padding: 10px 20px;
    transition: background-color 0.3s;
}

.invite-play-button:hover {
    color: #000;
}

.invite-play-button:disabled {
    cursor: not-allowed;
    color: #aaa;
}
</style>

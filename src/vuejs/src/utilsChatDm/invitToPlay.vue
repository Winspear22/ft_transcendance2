<template>
    <div>
        <input v-model="username" placeholder="Nom d'utilisateur" />
        <button @click="sendPlayRequest">Inviter à jouer</button>
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
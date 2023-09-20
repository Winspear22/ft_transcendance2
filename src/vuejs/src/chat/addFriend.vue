<template>
    <div>
        <input v-model="username" placeholder="Nom d'utilisateur" />
        <button @click="sendFriendRequest" :disabled="!username">Envoyer une demande d'ami</button>
        <div v-if="popupMessage">{{ popupMessage }}</div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'AddFriend',
    setup() {
        const username = ref('');
        const popupMessage = ref('');
        const store = useStore();
        const socket = store.getters.socket;

        const handleResponse = (message) => {
            popupMessage.value = message;
            username.value = '';
        };

        onMounted(() => {
            socket.on('sendFriendRequestSuccess', handleResponse);
            socket.on('sendFriendRequestError', handleResponse);
        });

        onBeforeUnmount(() => {
            socket.off('sendFriendRequestSuccess', handleResponse);
            socket.off('sendFriendRequestError', handleResponse);
        });
        
        const sendFriendRequest = () => {
            if (username.value.trim()) {
                socket.emit('sendFriendRequest', { receiverUsername: username.value });
            } else {
                popupMessage.value = "Veuillez entrer un nom d'utilisateur valide.";
            }
        };
        
        return {
            username,
            popupMessage,
            sendFriendRequest
        };
    }
};
</script>


<template>
    <div>
        <input v-model="username" placeholder="Nom d'utilisateur" />
        <button @click="sendFriendRequest">Envoyer une demande d'ami</button>
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

        const handleSuccess = (message) => {
            if (/^Your/.test(message)) {
                popupMessage.value = message;
            }
        };

        const handleError = (message) => {
            popupMessage.value = message;
        };
        
        onMounted(() => {
            socket.on('sendFriendRequestSuccess', handleSuccess);
            socket.on('sendFriendRequestError', handleError);
        });

        onBeforeUnmount(() => {
            socket.off('sendFriendRequestSuccess', handleSuccess);
            socket.off('sendFriendRequestError', handleError);
        });
        
        const sendFriendRequest = () => {
            socket.emit('sendFriendRequest', { receiverUsername: username.value });
        };
        
        return {
            username,
            popupMessage,
            sendFriendRequest
        };
    }
};
</script>

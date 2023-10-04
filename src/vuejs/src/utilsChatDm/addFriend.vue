<template>
    <div class="add-friend-container">
        <input class="add-friend-input" v-model="username" placeholder="Nom d'utilisateur" />
        <button class="add-friend-button" @click="sendFriendRequest" :disabled="!isUsernameValid">Envoyer une demande d'ami</button>
        <div v-if="popupMessage">{{ popupMessage }}</div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

const SEND_FRIEND_REQUEST_SUCCESS = 'sendFriendRequestSuccess';
const SEND_FRIEND_REQUEST_ERROR = 'sendFriendRequestError';

export default {
    name: 'AddFriend',
    setup() {
        const username = ref('');
        const popupMessage = ref('');
        const store = useStore();
        const socketDm = store.getters.socketDm;

        const isUsernameValid = () => username.value.trim().length > 0;

        const handleResponse = (message) => {
            popupMessage.value = message;
            username.value = '';
            setTimeout(() => {
                popupMessage.value = '';
            }, 5000);
        };

        onMounted(() => {
            socketDm.on(SEND_FRIEND_REQUEST_SUCCESS, handleResponse);
            socketDm.on(SEND_FRIEND_REQUEST_ERROR, handleResponse);
        });

        onBeforeUnmount(() => {
            socketDm.off(SEND_FRIEND_REQUEST_SUCCESS, handleResponse);
            socketDm.off(SEND_FRIEND_REQUEST_ERROR, handleResponse);
        });

        const sendFriendRequest = () => {
            if (isUsernameValid()) {
                socketDm.emit('sendFriendRequest', { receiverUsername: username.value });
            } else {
                popupMessage.value = "Veuillez entrer un nom d'utilisateur valide.";
            }
        };

        return {
            username,
            popupMessage,
            sendFriendRequest,
            isUsernameValid
        };
    }
};
</script>

<style scoped>
.add-friend-container {
    font-family: 'Arial', sans-serif; 
}

.add-friend-input {
    background-color: transparent;
    border: none; 
    padding: 10px;
    margin: 10px 0;
    color: #2fe8ee; 
}

.add-friend-input:focus {
    outline: none;
    box-shadow: none; 
}

.add-friend-button {
    background-color: transparent;
    color: #2fe8ee; 
    border: none;
    cursor: pointer;
    padding: 10px 20px;
    transition: background-color 0.3s;
}

.add-friend-button:hover {
    color: #000; 
}

.add-friend-button:disabled {
    cursor: not-allowed;
    color: #aaa;
}

</style>
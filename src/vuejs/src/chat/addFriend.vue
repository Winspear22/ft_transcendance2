<template>
    <div>
        <input v-model="username" placeholder="Nom d'utilisateur" />
        <button @click="sendFriendRequest">Envoyer une demande d'ami</button>
        <div v-if="popupMessage">{{ popupMessage }}</div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'AddFriend',
    setup() {
        const username = ref('');
        const popupMessage = ref('');
        const store = useStore();
        const socket = store.getters.socket;
        
        onMounted(() => {
            socket.on('sendFriendRequestSuccess', message => {
                if (message.startsWith('Your')) {
                    popupMessage.value = message;
                }
            });

            socket.on('sendFriendRequestError', message => {
                popupMessage.value = message;
            });
        });
        
        const sendFriendRequest = () => {
            if (socket) {
                socket.emit('sendFriendRequest', { receiverUsername: username.value });
            }
        }
        
        return {
            username,
            popupMessage,
            sendFriendRequest
        };
    }
};
</script>

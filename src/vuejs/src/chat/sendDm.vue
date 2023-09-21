<template>
    <div class="send-message-form">
        <input type="text" v-model="message" placeholder="Écrivez votre message..." />
        <button @click="sendMessage">Envoyer</button>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';

export default {
    props: {
        chat: Object, 
        userInfo: Object
    },
    setup(props) {
        const store = useStore();
        const socketDm = store.getters.socketDm;

        const message = ref("");

        const sendMessage = () => {
            if (!props.userInfo) {
                console.warn("userInfo est null ou non défini.");
                return;
            }
            if (message.value.trim().length === 0) return;

            const payload = {
                room: props.chat.room, 
                senderUsername: props.userInfo.username,
                message: message.value.trim(),
                receiverUsername: props.chat.users.find(u => u.username !== props.userInfo.username).username
            };

            socketDm.emit('sendDM', payload);
            message.value = ""; // Reset the input after sending the message
        }

        return {
            message,
            sendMessage
        }
    }
}
</script>

<style>
.send-message-form {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.send-message-form input {
    flex: 1;
    padding: 10px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.send-message-form button {
    padding: 10px 20px;
    background-color: blue;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>

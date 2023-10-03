<template>
    <div class="send-message-form">
        <input type="text"
               v-model="message"
               placeholder="Écrivez votre message..."
               @keyup.enter="sendMessage" />
        <button @click="sendMessage">Envoyer</button>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'SendMessageForm',

    props: {
        chat: {
            type: Object,
            required: true,
            default: () => ({})
        },
        userInfo: {
            type: Object,
            required: true,
            default: () => ({})
        }
    },

    setup(props) {
        const store = useStore();
        const socketDm = store.getters.socketDm;
        const message = ref("");

        const sendMessage = () => {
            if (!message.value.trim()) return;
            if (!props.userInfo) {
                console.warn("userInfo est null ou non défini.");
                return;
            }

            const receiver = props.chat.users.find(u => u.id !== props.userInfo.id);
            if (!receiver) return;

            const payload = {
                room: props.chat.room,
                senderUsername: props.userInfo.username,
                message: message.value.trim(),
                receiverId: receiver.id
            };
            
            socketDm.emit('sendDM', payload);
            message.value = "";
        }

        return {
            message,
            sendMessage
        }
    }
}
</script>

<style scoped>
.send-message-form {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

input {
    flex: 1;
    padding: 10px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.1);
    color: black;
    transition: color 0.3s;
}

input::placeholder {
    color: rgba(36, 89, 213, 0.6);
}

button {
    padding: 10px 20px;
    background-color: transparent;
    color: #2459d5;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: color 0.3s;
}

button:hover {
    color: black;
}
</style>

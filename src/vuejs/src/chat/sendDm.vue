<template>
    <div class="send-message-form">
        <input type="text" 
               v-model="message" 
               placeholder="Écrivez votre message..." 
               @keyup.enter="sendMessage" /> <!-- écoute de la touche Entrée -->
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
<style scooped>
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
    background-color: rgba(255, 255, 255, 0.1); /* fond légèrement opaque */
    color: bleck; /* couleur d'écriture bleu claire pour le texte saisi */
    transition: color 0.3s; 
}

.send-message-form input::placeholder {
    color: rgba(36, 89, 213, 0.6); /* couleur d'écriture bleu claire, légèrement transparente pour le texte indicatif */
}

.send-message-form button {
    padding: 10px 20px;
    background-color: transparent;
    color: #2459d5;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: color 0.3s;
}

.send-message-form button:hover {
    color: black;
}
</style>

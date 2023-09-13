<template>
    <div> <!-- Elément racine ajouté -->
        <div v-for="chat in chats" :key="chat.id">
            <h3>Chat with {{ getChatName(chat) }}</h3>
            <div v-if="chat.messages && chat.messages.length > 0">
                <div v-for="message in chat.messages" :key="message.id">
                    <span>{{ message.senderName }}: {{ message.text }}</span>
                </div>
            </div>
            <div v-else>
                <p>No messages yet. Start a conversation!</p>
            </div>
        </div>
    </div> <!-- Fin de l'élément racine -->
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
    setup() {
        const store = useStore();
        const socket = store.getters.socket;

        const chats = ref([]);

        onMounted(() => {
            console.log("on devrait voir une room non voila le socket", socket);
            socket.on('emitDM', (data) => {
                chats.value = data;
                console.log("on devrait voir une room non", data);
            });
        });

        function getChatName(chat) {
            if (chat.allUsers && chat.allUsers.length > 0) {
                return chat.allUsers.map(user => user.name).join(', ');
            } else {
                return "Unknown";
            }
        }

        return {
            chats,
            getChatName
        }
    }
};
</script>

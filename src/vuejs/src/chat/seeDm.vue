<template>
    <div> <!-- Elément racine ajouté -->
        <info-user @userInfoFetched="handleUserInfo"></info-user>
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
import InfoUser from '../setting/infoUser.vue'; 


export default {
    components: {
        InfoUser,
    },
    setup() {
        const store = useStore();
        const socket = store.getters.socket;
        const userInfo = ref(null);

        const chats = ref([]);

        onMounted(() => {
            socket.on('emitDM', (data) => {
                chats.value = data;
            console.log("LALALA", chats.value);
            if (chats.value.length > 0 && chats.value[0].users.length > 0) {
                const firstUserOfFirstChat = chats.value[0].users[0];
                console.log("First user of the first chat:", firstUserOfFirstChat);
            }

            if (chats.value.length > 0 && chats.value[0].users.length > 1) {
                const secondUserOfFirstChat = chats.value[0].users[1];
                console.log("Second user of the first chat:", secondUserOfFirstChat);
            }
            });
            socket.emit('emitDM');
        });

        function handleUserInfo(user) {
            userInfo.value = user;
            console.log('Informations de l\'utilisateur reçues:', user);
        }

        function getChatName(chat) {
            if (chat.users.length > 0) {
                if (userInfo.value && chat.users[0].username !== userInfo.value.username) {
                    return chat.users[0].username;
                }
                else if (chat.users.length > 1) {
                    return chat.users[1].username;
                }
            }
            return "Unknown";
        }  


        return {
            chats,
            getChatName,
            userInfo,
            handleUserInfo, 
        }
    }
};
</script>

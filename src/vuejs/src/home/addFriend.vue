<template>
    <div>
        <button class="button-add-friend" @click="sendFriendRequestFromProfile">Ajouter comme ami</button>
        <div class="popup-message" v-if="popupMessage">{{ popupMessage }}</div>
    </div>
</template>

<script> 
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'AddFromProfileButton',
    props: {
        profileUsername: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const popupMessage = ref('');
        const store = useStore();
        const socketDm = store.getters.socketDm;

        const handleResponse = (message) => {
            popupMessage.value = message;
        };

        onMounted(() => {
            socketDm.on('sendFriendRequestSuccess', handleResponse);
            socketDm.on('sendFriendRequestError', handleResponse);
        });

        onBeforeUnmount(() => {
            socketDm.off('sendFriendRequestSuccess', handleResponse);
            socketDm.off('sendFriendRequestError', handleResponse);
        });
        
        const sendFriendRequestFromProfile = () => {
            socketDm.emit('sendFriendRequest', { receiverUsername: props.profileUsername });
        };
        
        return {
            popupMessage,
            sendFriendRequestFromProfile
        };
    }
};
</script>


<style scoped>
.button-add-friend {
    background-color: transparent; 
    border: none; 
    color: #2fe8ee; 
    cursor: pointer; 
    transition: color 0.3s ease; 
    font-size: 16px;  
}

.button-add-friend:hover {
    color: black;
}
</style>

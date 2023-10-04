<template>
    <div class="see-user-modal">
        <button class="close-btn" @click="$emit('close')">✖️</button>
        <h2>Liste des utilisateurs</h2>
        <ul>
            <li v-for="user in usersDTO" :key="user.id">
                <router-link v-if="isMe(user)" :to="'/setting'"> {{  user.username }} </router-link>
                <router-link v-else-if="isFriend(user)" :to="`/friend-profile/${user.username}`">{{ user.username }}</router-link>
                <router-link v-else :to="`/online-profile/${user.username}`">{{ user.username }}</router-link>
            </li>
        </ul>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
    props: {
        usersDTO: {
            type: Array,
            required: true
        }
    },
    setup() {
        const friends = ref([]);
        const userInfo = ref(null);
        const store = useStore();
        const socketDm = store.getters.socketDm;

        onMounted(async () => {
            socketDm.emit('emitFriends');  // Demande de la liste d'amis

            socketDm.on('emitFriends', handleFriendDetails);

            await fetchUserInfo();
        });

        onBeforeUnmount(() => {
            socketDm.off('emitFriends', handleFriendDetails); // Se désinscrire de l'événement lors de la destruction
        });

        const handleFriendDetails = (friendDetails) => {
            friends.value = friendDetails;  // Mettre à jour la liste des amis avec les données reçues
        };

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('http://localhost:3000/auth/getUserInfo', { withCredentials: true });
                if (response.data.success) {
                    userInfo.value = response.data.user;
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
            }
        };

        const isFriend = (user) => {
            return friends.value.some(friend => friend.id === user.id);
        };

        const isMe = (user) => {
            return userInfo.value && userInfo.value.username === user.username;
        };

        return {
            isFriend,
            isMe
        };
    }
};
</script>
  
  <style scoped>
  .see-user-modal {
    width: 300px;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
  }
  
  .close-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  </style>
<template>
    <div class="list-container">

        <h2 v-if="friends && friends.length">Liste d'amis</h2>
        <ul v-if="friends && friends.length">
            <li v-for="friend in friends" :key="friend.id">
                <img :src="friend.profile_picture" alt="Profile Picture" />
                <router-link :to="`/profile/${friend.username}`">{{ friend.username }}</router-link>
            </li>
        </ul>
        <div v-if="!friends.length">Pas encore d'ami.</div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'ListFriend',
    setup() {
        const friends = ref([]);
        const store = useStore();
        const socketDm = store.getters.socketDm;

        onMounted(() => {
            socketDm.emit('emitFriends');  // Demande de la liste d'amis

            socketDm.on('emitFriends', (friendDetails) => {
                friends.value = friendDetails;  // Mettre à jour la liste des amis avec les données reçues
            });
        });

        return {
            friends
        };
    }
};
</script>

<style>
.list-container {
    width: 50%; 
    border: 1px solid #2fe8ee;
    overflow: auto;
    max-height: 80vh;
    padding: 10px;
    margin: 5px 0;
    background-color: transparent;
    display: flex;
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    color: #2fe8ee;
}

.list-container img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
    border-color: #2fe8ee;
    color: #2fe8ee;
}

.list-container li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%; 
    color: #2fe8ee;
}

.list-container h2 {
    text-align: center; 
    color: #2fe8ee;
}

.home-container {
    display: flex; 
    justify-content: space-between; 
}
</style>

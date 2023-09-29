<template>
    <div class="list-container">
        <ul v-if="onlineUsers && onlineUsers.length">
            <h2>Personnes en ligne :</h2>
            <li v-for="user in onlineUsers" :key="user.id">
                <router-link :to="`/profile/${user.username}`">{{ user.username }}</router-link>
            </li>
        </ul>
        <div v-if="!onlineUsers.length" class="no-users-message">Personne n'est connecté pour le moment.</div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'OnlineUsers',
    setup() {
        const onlineUsers = ref([]);
        const store = useStore();  

        function requestOnlineUsers() {
            if(store.state.gameSocket) {
                store.state.gameSocket.emit('onlineUsers');
            }
        }

        onMounted(() => {
            requestOnlineUsers();

            if(store.state.gameSocket) {
                store.state.gameSocket.on('onlineUsers', (users) => {
                    onlineUsers.value = users;
                });
            }
        });

        return {
            onlineUsers
        };
    }
};
</script>

<style>
.list-container {
    width: 50%; 
    border: 1px solid #2459d5;
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
    border-color: #2459d5 ;
    color: #2fe8ee;
}

.list-container li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%; 
    color: #2459d5 ;
}

.list-container h2 {
    text-align: center; 
    color: #2459d5 ;
}

.home-container {
    display: flex; 
    justify-content: space-between; 
}
.list-container .no-users-message {
    color: #2459d5;
    text-align: center;
}
.list-container a {
    color: #2459d5; /* La couleur bleu foncé que vous utilisez */
    text-decoration: none; /* Pour supprimer le soulignement du lien */
}

.list-container li a:hover {
    color: black !important; /* La couleur reste la même au survol */
}

.list-container a:visited {
    color: #2459d5; /* La couleur reste la même après avoir été visité */
}


</style>


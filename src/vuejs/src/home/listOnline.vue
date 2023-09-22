<template>
    <div class="list-container">
        <h2>Personnes en ligne :</h2>
        <ul v-if="onlineUsers && onlineUsers.length">
            <li v-for="user in onlineUsers" :key="user.id">
                <img :src="user.profile_picture" alt="Profile Picture" />
                <router-link :to="`/profile/${user.username}`">{{ user.username }}</router-link>
            </li>
        </ul>
        <div v-if="!onlineUsers.length">Personne n'est connecté pour le moment.</div>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
    name: 'OnlineUsers',
    setup() {
        const onlineUsers = ref([]);

        // Plus tard, vous pouvez récupérer la liste des utilisateurs en ligne ici

        return {
            onlineUsers
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


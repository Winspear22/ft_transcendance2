<template>
    <div class="list-container-friend">
        <h2 v-if="friends && friends.length">Liste d'amis</h2>
        <ul v-if="friends && friends.length">
            <li v-for="friend in friends" :key="friend.id">
                <img v-if="friend.profile_picture" :src="getImageSrc(friend.profile_picture)" alt="Profile Picture" />
                <div v-else>Aucune photo de profil disponible</div>
                <router-link :to="`/friend-profile/${friend.username}`">{{ friend.username }}</router-link>
            </li>
        </ul>
        <div v-if="!friends.length">Pas encore d'ami.</div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'ListFriend',
    setup() {
        const friends = ref([]);
        const store = useStore();
        const socketDm = store.getters.socketDm;

        const handleFriendDetails = (friendDetails) => {
            friends.value = friendDetails;  // Mettre à jour la liste des amis avec les données reçues
        };

        onMounted(() => {
            socketDm.emit('emitFriends');  // Demande de la liste d'amis
            socketDm.on('emitFriends', handleFriendDetails);
        });

        onBeforeUnmount(() => {
            socketDm.off('emitFriends', handleFriendDetails); // Se désinscrire de l'événement lors de la destruction
        });

        const getImageSrc = (filename) => {
            try {
                return require(`@/assets/${filename}`);
            } catch (e) {
                console.error("Erreur lors de la récupération de l'image:", e);
                return '';  // ou une image par défaut
            }
        };

        return {
            friends,
            getImageSrc
        };
    }
};
</script>



<style>
.list-container-friend {
    width: 50%; 
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

.list-container-friend img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
    color: #2fe8ee;
}

.list-container-friend li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%; 
    color: #2fe8ee;
}

.list-container-friend h2 {
    text-align: center; 
    color: #2fe8ee;
}

.home-container-friend {
    display: flex; 
    justify-content: space-between; 
}
.list-container-friend a {
    color: #2fe8ee; /* La couleur bleu foncé que vous utilisez */
    text-decoration: none; /* Pour supprimer le soulignement du lien */
}

.list-container-friend li a:hover {
    color: black !important;
}

.list-container-friend a:visited {
    color: #2fe8ee; /* La couleur reste la même après avoir été visité */
}
</style>

<template>
    <div class="profile-online-container">
        <!-- Affichage de la photo -->
        <img v-if="friendProfile.profile_picture" class="profile-picture" :src="getImageSrc(friendProfile.profile_picture)" alt="Friend's Profile Picture" />
        <div v-else>Aucune photo de profil disponible</div>
        
        <!-- Affichage du nom -->
        <h2>{{ friendProfile.username || username }}</h2>
        
        <!-- Affichage du statut -->
        <p>Status: {{ friendProfile.user_status || 'Unknown' }}</p>

        <!-- Affichage du match history -->
        <div v-if="friendProfile.matchHistory">
            <p>Total Parties: {{ friendProfile.matchHistory.total_parties }}</p>
            <p>Total Victoires: {{ friendProfile.matchHistory.total_victoire }}</p>
            <p>Total Défaites: {{ friendProfile.matchHistory.total_défaite }}</p>
            <p>Winrate: {{ friendProfile.matchHistory.winrate }}%</p>
        </div>
        <!-- Ajouter comme ami -->
        <AddFromProfileButton :profileUsername="friendProfile.username || username" />
        <ReceivingFriend></ReceivingFriend>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import AddFromProfileButton from './addFriend.vue';
import ReceivingFriend from '../utilsChatDm/receivingFriend.vue';

export default {
    props: {
        username: {
            type: String,
            required: true
        }
    },
    components: {
        AddFromProfileButton,
        ReceivingFriend,
    },
    setup(props) {
        const store = useStore();
        const gameSocket = store.getters.gameSocket; 
        const friendProfile = ref({}); 

        onMounted(() => {
            if (gameSocket) {
                gameSocket.emit('friendProfile', props.username);

                gameSocket.on('friendProfile', (profile) => {
                    friendProfile.value = profile[0];
                });
            }
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
            friendProfile,
            getImageSrc
        };
    }
};
</script>



<style scoped>
.profile-online-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; 
    height: 100vh; 
    text-align: center; 
    color: #2fe8ee;  
}

.profile-picture {
    width: 100px; 
    height: 100px; 
    border-radius: 50%; 
    object-fit: cover; 
}
</style>






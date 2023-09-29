<template>
    <div class="profile-friend-container">
        <!-- Affichage de la photo -->
        <img v-if="friendProfile.profile_picture" class="profile-picture" :src="friendProfile.profile_picture" alt="Friend's Profile Picture" />
        
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
    </div>
</template>


<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';


export default {
    props: {
        username: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const store = useStore();
        const gameSocket = store.getters.gameSocket; 
        const friendProfile = ref({}); 

        onMounted(() => {
            if (gameSocket) {
                gameSocket.emit('friendProfile', props.username);
                console.log("J'ai envoye ma demande au back.");

                gameSocket.on('friendProfile', (profile) => {
                    friendProfile.value = profile[0];
                    console.log(friendProfile.value);
                });
            }
        });

        return {
            friendProfile
        };
    }
};
</script>


<style scoped>
.profile-friend-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; 
    height: 100vh; 
    text-align: center; 
}

.profile-picture {
    width: 100px; 
    height: 100px; 
    border-radius: 50%; 
    object-fit: cover; 
}
</style>






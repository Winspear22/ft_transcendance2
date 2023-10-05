<template>
  <div class="friend-request-item">
    <!-- Récupération et affichage de la photo de profil -->
    <img v-if="request.profile_picture" :src="getImageSrc(request.profile_picture)" alt="Profile" />
    <div v-else>Aucune photo de profil disponible</div>
    
    <span>{{ request.username }}</span>
    <div class="buttons-container">
    <button class="accept-button" @click="acceptRequest">Accepter</button>
    <button class="decline-button" @click="declineRequest">Refuser</button>
</div>

  </div>
</template>

<script>
import { onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'FriendRequestItem',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const socketDm = store.getters.socketDm;
    const router = useRouter();
  
    const handleAcceptFriendRequest = () => {
      router.push({ name: 'Home' });
    };
  
    const handleRefuseFriendRequest = () => {
      router.push({ name: 'Home' });
    };
  
    const acceptRequest = () => {
      socketDm.emit('acceptFriendRequest', { receiverUsername: props.request.username });
    };
  
    const declineRequest = () => {
      socketDm.emit('refuseFriendRequest', { receiverUsername: props.request.username });
    };

    const getImageSrc = (filename) => {
      try {
        return require(`@/assets/${filename}`);
      } catch (e) {
        console.error("Erreur lors de la récupération de l'image:", e);
        return '';  // ou une image par défaut
      }
    };
  
    onMounted(() => {
      socketDm.on('acceptFriendRequest', handleAcceptFriendRequest);
      socketDm.on('refuseFriendRequest', handleRefuseFriendRequest);
    });
  
    onBeforeUnmount(() => {
      socketDm.off('acceptFriendRequest', handleAcceptFriendRequest);
      socketDm.off('refuseFriendRequest', handleRefuseFriendRequest);
    });
  
    return {
      acceptRequest,
      declineRequest,
      getImageSrc  
    };
  }
};
</script>
<style scoped>
.friend-request-item {
  display: flex;
  flex-direction: column; /* Pour empiler les éléments verticalement */
  align-items: center; /* Centrer les éléments horizontalement */
  margin-bottom: 1em;
  padding: 1em;
}

.friend-request-item img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 0.5em; /* Espace sous l'image */
}

/* Styles pour les boutons */
.accept-button, .decline-button {
  background-color: transparent;
  color: #2fe8ee; 
  border: none;
  cursor: pointer;
  padding: 10px 20px;
  transition: color 0.3s;
  margin-top: 0.5em; /* Espace au-dessus des boutons */
}

.accept-button:hover, .decline-button:hover {
  color: #000;
}

.accept-button:disabled, .decline-button:disabled {
  cursor: not-allowed;
  color: #aaa;
}

/* Styles pour afficher les boutons côte à côte */
.buttons-container {
  display: flex;
  gap: 10px; /* Espacement entre les boutons */
}



</style>

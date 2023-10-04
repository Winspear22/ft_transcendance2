<template>
  <div class="friend-request-item">
    <!-- Récupération et affichage de la photo de profil -->
    <img v-if="request.profile_picture" :src="getImageSrc(request.profile_picture)" alt="Profile" />
    <div v-else>Aucune photo de profil disponible</div>
    
    <span>{{ request.username }}</span>
    <button @click="acceptRequest">Accepter</button>
    <button @click="declineRequest">Refuser</button>
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
      getImageSrc  // Ajout de cette méthode pour le template
    };
  }
};
</script>


  
  
  <style scoped>
    .friend-request-item {
      display: flex;
      align-items: center;
      margin-bottom: 1em;
    }
  
    .friend-request-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 0.5em;
    }
  </style>
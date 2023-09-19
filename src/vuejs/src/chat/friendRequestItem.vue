<template>
    <div :key="componentKey" class="friend-request-item">
      <img :src="request.profile_picture" alt="Profile" />
      <span>{{ request.username }}</span>
      <button @click="acceptRequest">Accepter</button>
      <button @click="declineRequest">Refuser</button>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

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
    const socket = store.getters.socket;

    const componentKey = ref(0); // Clé initiale pour forcer le re-rendu

    const acceptRequest = () => {
      socket.emit('acceptFriendRequest', { receiverUsername: props.request.username });
    };

    const declineRequest = () => {
      socket.emit('refuseFriendRequest', { receiverUsername: props.request.username });
    };

    const handleAcceptFriendRequest = () => {
      componentKey.value++;
    };

    onMounted(() => {
      socket.on('acceptFriendRequest', handleAcceptFriendRequest);
    });

    onBeforeUnmount(() => {
      socket.off('acceptFriendRequest', handleAcceptFriendRequest);
    });

    return {
      acceptRequest,
      declineRequest,
      componentKey
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

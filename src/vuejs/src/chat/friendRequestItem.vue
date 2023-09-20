<template>
  <div class="friend-request-item">
    <img :src="request.profile_picture" alt="Profile" />
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
  const socket = store.getters.socket;
  const router = useRouter();

  const handleAcceptFriendRequest = (message) => {
    console.log(message);
    router.push({ name: 'Home' });
  };

  const handleRefuseFriendRequest = (message) => {
    console.log(message);
    router.push({ name: 'Home' });
  };

  const acceptRequest = () => {
    socket.emit('acceptFriendRequest', { receiverUsername: props.request.username });
  };

  const declineRequest = () => {
    socket.emit('refuseFriendRequest', { receiverUsername: props.request.username });
  };

  onMounted(() => {
    socket.on('acceptFriendRequest', handleAcceptFriendRequest);
    socket.on('refuseFriendRequest', handleRefuseFriendRequest);
  });

  onBeforeUnmount(() => {
    socket.off('acceptFriendRequest', handleAcceptFriendRequest);
    socket.off('refuseFriendRequest', handleRefuseFriendRequest);
  });

  return {
    acceptRequest,
    declineRequest
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

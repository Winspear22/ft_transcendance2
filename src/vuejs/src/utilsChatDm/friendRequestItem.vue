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
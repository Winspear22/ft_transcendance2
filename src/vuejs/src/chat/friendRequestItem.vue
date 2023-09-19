<template>
    <div class="friend-request-item">
      <img :src="request.profile_picture" alt="Profile" />
      <span>{{ request.username }}</span>
      <button @click="acceptRequest">Accepter</button>
      <button @click="declineRequest">Refuser</button>
    </div>
</template>

<script>
import { computed } from 'vue';
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

    // En utilisant computed pour garder le username de la demande
    const senderUsername = computed(() => props.request.username);

    const acceptRequest = () => {
      socket.emit('acceptFriendRequest', { receiverUsername: senderUsername.value });
    };

    const declineRequest = () => {
      socket.emit('refuseFriendRequest', { receiverUsername: senderUsername.value });
    };

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
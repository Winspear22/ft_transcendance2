<template>
    <transition name="fade">
      <div v-if="hasFriendRequest" class="friend-request-popup">
        <p>{{ requestMessage }}</p>
        <button @click="acceptRequest">Accepter</button>
        <button @click="declineRequest">Refuser</button>
      </div>
    </transition>
  </template>
  
  <script>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useStore } from 'vuex';
  
  const SEND_FRIEND_REQUEST_SUCCESS = 'sendFriendRequestSuccess';
  const ACCEPT_FRIEND_REQUEST = 'acceptFriendRequest';
  const REFUSE_FRIEND_REQUEST = 'refuseFriendRequest';
  
  export default {
    setup() {
      const store = useStore();
      const socketDm = store.getters.socketDm;
  
      const hasFriendRequest = ref(false);
      const senderUsername = ref('');
  
      const requestMessage = computed(() => `Demande d'ami de ${senderUsername.value}`);
  
      const extractUsername = (message) => {
        const match = /^Demande d'ami de (.+)$/.exec(message);
        return match ? match[1] : null;
      };
  
      const handleRequest = (message) => {
        const username = extractUsername(message);
        if (username) {
          senderUsername.value = username;
          hasFriendRequest.value = true;
          setTimeout(() => {
            hasFriendRequest.value = false;
          }, 5000);
        }
      };
  
      onMounted(() => {
        socketDm.on(SEND_FRIEND_REQUEST_SUCCESS, handleRequest);
      });
  
      onBeforeUnmount(() => {
        socketDm.off(SEND_FRIEND_REQUEST_SUCCESS, handleRequest);
      });
  
      const acceptRequest = () => {
        socketDm.emit(ACCEPT_FRIEND_REQUEST, { receiverUsername: senderUsername.value });
        hasFriendRequest.value = false;
      };
  
      const declineRequest = () => {
        socketDm.emit(REFUSE_FRIEND_REQUEST, { receiverUsername: senderUsername.value });
        hasFriendRequest.value = false;
      };
  
      return {
        hasFriendRequest,
        requestMessage,
        acceptRequest,
        declineRequest
      };
    }
  };
  </script>
  
  <style scoped>
  .friend-request-popup {
    position: fixed;
    right: 20px;
    bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }
  
  .friend-request-popup button + button {
    margin-left: 10px;
  }
  </style>
  
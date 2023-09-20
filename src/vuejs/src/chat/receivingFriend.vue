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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const socket = store.getters.socket;

    const hasFriendRequest = ref(false);
    const requestMessage = ref('');
    const senderUsername = ref('');

    const handleRequest = (message) => {
      if (/^Demande d'ami de/.test(message)) {
        hasFriendRequest.value = true;
        requestMessage.value = message;
        senderUsername.value = message.split(' ')[3];

        setTimeout(() => {
          hasFriendRequest.value = false;
        }, 10000); // 10 secondes
      }
    };

    onMounted(() => {
      socket.on('sendFriendRequestSuccess', handleRequest);
    });

    onBeforeUnmount(() => {
      socket.off('sendFriendRequestSuccess', handleRequest);
    });

    const acceptRequest = () => {
      socket.emit('acceptFriendRequest', { receiverUsername: senderUsername.value });
      hasFriendRequest.value = false;
    };

    const declineRequest = () => {
      socket.emit('refuseFriendRequest', { receiverUsername: senderUsername.value });
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
</style>
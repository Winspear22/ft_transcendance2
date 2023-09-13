<template>
    <div v-if="hasFriendRequest">
      <div class="friend-request-popup">
        <p>{{ requestMessage }}</p>
        <button v-if="hasFriendRequest" @click="acceptRequest">Accepter</button>
        <button v-if="hasFriendRequest" @click="declineRequest">Refuser</button>
      </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const socket = store.getters.socket;

    const hasFriendRequest = ref(false);
    const requestMessage = ref('');
    const senderUsername = ref('');

    onMounted(() => {
      socket.on('sendFriendRequestSuccess', message => {
        if (message.startsWith('Friend request from')) {
          hasFriendRequest.value = true;
          requestMessage.value = message;
          console.log("value du send request", message);
          senderUsername.value = message.split(' ')[3];
        }
      });
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
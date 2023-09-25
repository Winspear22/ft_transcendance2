<template>
    <div v-if="hasGameInvitRequest">
      <div class="friend-request-popup">
        <p>{{ requestMessage }}</p>
        <button v-if="hasGameInvitRequest" @click="acceptRequest">Accepter</button>
        <button v-if="hasGameInvitRequest" @click="declineRequest">Refuser</button>
      </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const socket = store.getters.gameSocket;

    const hasGameInvitRequest = ref(false);
    const requestMessage = ref('');
    const senderUsername = ref('');

    onMounted(() => {
      socket.on('invitPlayRequestSuccess', message => {
        if (message.startsWith('Invitation to play from')) {
          hasGameInvitRequest.value = true;
          requestMessage.value = message;
          console.log("value du send request", message);
          senderUsername.value = message.split(' ')[4];
        }
      });
    });

    const acceptRequest = () => {
      socket.emit('acceptInvitToPlayRequest', { receiverUsername: senderUsername.value });
      hasGameInvitRequest.value = false;
    };

    const declineRequest = () => {
      socket.emit('declineInvitToPlayRequest', { receiverUsername: senderUsername.value });
      hasGameInvitRequest.value = false;
    };

    return {
      hasGameInvitRequest,
      requestMessage,
      acceptRequest,
      declineRequest
    };
  }
};
</script>
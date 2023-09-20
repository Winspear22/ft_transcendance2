<template>
  <div v-if="pendingFriendRequests.length > 0">
    <h2>Demandes d'amis en attente</h2>
    <div v-for="request in pendingFriendRequests" :key="request.id">
      <FriendRequestItem :request="request" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import FriendRequestItem from './friendRequestItem.vue';

export default {
  name: 'PendingFriendRequests',
  components: {
    FriendRequestItem
  },
  setup() {
    const store = useStore();
    const socket = store.getters.socket;

    const pendingFriendRequests = ref([]);

    const updateFriendRequests = (requests) => {
      pendingFriendRequests.value = requests;
    };

    const handleNewFriendRequest = (newRequest) => {
      pendingFriendRequests.value.push(newRequest);
    };

    onMounted(() => {
      socket.emit('emitFriendRequests');
      socket.on('emitFriendRequests', updateFriendRequests);
      // IL VA FALLOIR MODIFIER ICI QUAND LE BACK EMETTERA A PARTIR D'EMIT ET NON SEND
      socket.emit('sendFriendRequest', { receiverUsername: "desiredUsername" });
      socket.on('newFriendRequest', handleNewFriendRequest); 
    });

    onBeforeUnmount(() => {
      socket.off('emitFriendRequests', updateFriendRequests);
      socket.off('newFriendRequest', handleNewFriendRequest);
    });

    return {
      pendingFriendRequests
    };
  }
};
</script>

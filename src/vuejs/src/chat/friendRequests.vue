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
    const socketDm = store.getters.socketDm;

    const pendingFriendRequests = ref([]);

    const updateFriendRequests = (requests) => {
      pendingFriendRequests.value = requests;
    };

    const handleNewFriendRequest = (newRequest) => {
      pendingFriendRequests.value.push(newRequest);
    };

    onMounted(() => {
      socketDm.emit('emitFriendRequests');
      socketDm.on('emitFriendRequests', updateFriendRequests);
      // IL VA FALLOIR MODIFIER ICI QUAND LE BACK EMETTERA A PARTIR D'EMIT ET NON SEND
      socketDm.emit('sendFriendRequest', { receiverUsername: "desiredUsername" });
      socketDm.on('newFriendRequest', handleNewFriendRequest); 
    });

    onBeforeUnmount(() => {
      socketDm.off('emitFriendRequests', updateFriendRequests);
      socketDm.off('newFriendRequest', handleNewFriendRequest);
    });

    return {
      pendingFriendRequests
    };
  }
};
</script>

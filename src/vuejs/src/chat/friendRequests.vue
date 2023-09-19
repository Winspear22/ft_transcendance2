<!-- FriendRequests.vue -->

<template>
  <div v-if="friendRequests && friendRequests.length > 0">
    <h2>Demandes d'amis en attente</h2>
    <div v-for="request in friendRequests" :key="request.id">
      <FriendRequestItem :request="request" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import FriendRequestItem from './friendRequestItem.vue';

export default {
  name: 'FriendRequests',
  components: {
    FriendRequestItem
  },
  setup() {
    const store = useStore();
    const socket = store.getters.socket;

    const friendRequests = ref([]);

    const updateFriendRequests = (requests) => {
      friendRequests.value = requests;
    };

    onMounted(() => {
      socket.emit('emitFriendRequests');  // Demande pour obtenir les demandes d'ami
      socket.on('emitFriendRequests', updateFriendRequests);
    });

    onBeforeUnmount(() => {
      socket.off('emitFriendRequests', updateFriendRequests);
    });

    return {
      friendRequests
    };
  }
};
</script>
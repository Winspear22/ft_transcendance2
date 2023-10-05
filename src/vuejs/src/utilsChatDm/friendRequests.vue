<template>
  <div v-if="pendingFriendRequests.length > 0">
    <h2 class="pending-title">Demandes d'amis en attente</h2>
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

    onMounted(() => {
      socketDm.emit('emitFriendRequests');
      socketDm.on('emitFriendRequests', updateFriendRequests);
    });

    onBeforeUnmount(() => {
      socketDm.off('emitFriendRequests', updateFriendRequests);
    });

    return {
      pendingFriendRequests
    };
  }
};
</script>

<style scoped>
.pending-title {
  color: #2fe8ee;
  text-align: center;
}
</style>

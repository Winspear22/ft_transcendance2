<template>
  <div class="rooms-container">
    <ul v-if="invitedRooms.length">
      <li v-for="room in invitedRooms" :key="room.id" class="centered-text blue-text">
        <span>Invitation pour rejoindre la salle privée : {{ room.roomName }}</span>
        <responseRoom :room="room" />
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import ResponseRoom from "./responseRoom";

export default {
  name: "InvitedRooms",
  components: { ResponseRoom },
  setup() {
    const store = useStore();
    const socketChat = store.getters.socketChat;
    const invitedRooms = ref([]);

    const handleRoomInvitation = (rooms) => {
      invitedRooms.value = rooms;
      console.log("handle room invitation", rooms);
    };

    onMounted(() => {
      socketChat.emit("emitRoomInvitation");
      socketChat.on("emitRoomInvitation", handleRoomInvitation);
    });

    onBeforeUnmount(() => {
      socketChat.off("emitRoomInvitation", handleRoomInvitation);
    });

    return {
      invitedRooms
    };
  }
};
</script>

<style scoped>
.rooms-container {
  text-align: center;
}

.centered-text {
  text-align: center;
  display: inline-block; 
}

.blue-text {
  color: #323239;
}
</style>

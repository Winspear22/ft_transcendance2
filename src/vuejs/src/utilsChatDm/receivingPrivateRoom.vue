<template>
    <div>
      <h2 v-if="invitedRooms.length">Rooms auxquelles je suis invité(e)</h2>
      <ul v-if="invitedRooms.length">
        <li v-for="room in invitedRooms" :key="room.id">
          Nom de la room: {{ room.roomName }}
          <responseRoom :room="room" />
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useStore } from "vuex";
  import ResponseRoom from "./responseRoom";
  
  export default {
    name: "InvitedRooms",
    components: { ResponseRoom },
    setup() {
      const store = useStore();
      const socketChat = store.getters.socketChat;
      const invitedRooms = ref([]);
  
      onMounted(() => {
        socketChat.on("emitRoomInvitation", (rooms) => {
          invitedRooms.value = rooms;
        });
  
        socketChat.emit("emitRoomInvitation");
      });
  
      return {
        invitedRooms
      };
    }
  };
  </script>
  
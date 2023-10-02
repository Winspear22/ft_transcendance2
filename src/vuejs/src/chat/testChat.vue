<template>
    <div class="rooms-container">
        <invitRoom />
        <AvailableRooms />
        <RoomsComp />
        <CreateChatRoom />
    </div>
</template>

<script>
import AvailableRooms from './availableRooms.vue';
import RoomsComp from './roomsComp.vue';
import CreateChatRoom from './createChatRoom.vue';
import invitRoom from './invitRoom.vue';

export default {
  name: "RoomsContainer",
  
  components: {
    AvailableRooms,
    CreateChatRoom,
    RoomsComp,
    invitRoom,
  }
};
</script>

<style scoped>
.rooms-container {
    padding: 20px;
}
</style>

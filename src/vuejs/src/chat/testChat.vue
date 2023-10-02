<template>
    <div class="rooms-container">
        <AvailableRooms />
        <RoomsComp />
        <CreateChatRoom />
    </div>
</template>

<script>
import AvailableRooms from './availableRooms.vue';
import RoomsComp from './roomsComp.vue';
import CreateChatRoom from './createChatRoom.vue';

export default {
  name: "RoomsContainer",
  
  components: {
    AvailableRooms,
    CreateChatRoom,
    RoomsComp,
  }
};
</script>

<style scoped>
/* You can style your container here */
.rooms-container {
    padding: 20px;
}
</style>

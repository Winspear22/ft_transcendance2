<template>
    <div class="rooms-container">
        <h1>Chat Rooms</h1>
        
        <RoomsComponent />
        <AvailableRooms />
        <CreateChatRoom />
    </div>
</template>

<script>
// Import the child components
import RoomsComponent from './roomsComponent.vue';
import AvailableRooms from './availableRooms.vue';
import CreateChatRoom from './createChatRoom.vue';

export default {
  name: "RoomsContainer",
  
  components: {
    RoomsComponent,
    AvailableRooms,
    CreateChatRoom,
  }
};
</script>

<style scoped>
/* You can style your container here */
.rooms-container {
    padding: 20px;
    border: 1px solid #e0e0e0;
}
</style>

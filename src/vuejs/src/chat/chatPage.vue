<template>
  <div class="chatContainer">
    <h1>C H A T</h1>
    <AddFriend />
    <FriendRequests />
    <ReceivingFriend />
    <SeeDmRoom />
  </div>
</template>

<script>
import AddFriend from './addFriend';
import FriendRequests from './friendRequests';
import ReceivingFriend from './receivingFriend';
import SeeDmRoom from './seeDmRoom';

export default {
  name: 'ChatContainer',
  components: {
    AddFriend,
    FriendRequests,
    ReceivingFriend,
    SeeDmRoom
  }
};
</script>
<template>
  <div class="chatContainer">
    <h1>C H A T</h1>
    <AddFriend />
    <FriendRequests />
    <ReceivingFriend />
    <SeeDm />
  </div>
</template>

<script>
import AddFriend from './addFriend';
import FriendRequests from './friendRequests';
import ReceivingFriend from './receivingFriend';
import SeeDm from './seeDm';

export default {
  name: 'ChatContainer',
  components: {
    AddFriend,
    FriendRequests,
    ReceivingFriend,
    SeeDm
  }
};
</script>
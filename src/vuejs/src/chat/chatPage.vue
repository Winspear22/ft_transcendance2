<template>
  <div class="chatContainer">
    <h1>C H A T</h1>
    <AddFriend></AddFriend>
    <friend-requests></friend-requests>
    <ReceivingFriend></ReceivingFriend>
    <SeeDm></SeeDm>
  </div>
</template>

<script>
import AddFriend from './addFriend';
import ReceivingFriend from './receivingFriend';
import FriendRequests from './friendRequests';
import SeeDm from './seeDm';

export default {
  name: 'ChatContainer',
  components: {
    AddFriend,
    ReceivingFriend,
    SeeDm,
    FriendRequests
  }
};
</script>

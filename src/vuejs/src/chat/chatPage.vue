<template>
  <div class="chatContainer">
    <h1>C H A T</h1>
    <AddFriend />
    <FriendRequests />
    <ReceivingFriend />
    <SeeDmRoom />
    <testChat/>
    <invitToPlay />
    <receivingInvitToPlay />
  </div>
</template>

<script>
import AddFriend from './addFriend';
import FriendRequests from './friendRequests';
import ReceivingFriend from './receivingFriend';
import SeeDmRoom from './seeDmRoom';
import testChat from './testChat';
import invitToPlay from './invitToPlay.vue';
import receivingInvitToPlay from './receivingInvitToPlay.vue';

export default {
  name: 'ChatContainer',
  components: {
    AddFriend,
    FriendRequests,
    ReceivingFriend,
    SeeDmRoom,
    testChat,
    invitToPlay,
    receivingInvitToPlay
  }
};
</script>
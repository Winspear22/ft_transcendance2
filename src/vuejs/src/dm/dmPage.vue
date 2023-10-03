<template>
    <div>
        <h2>D M</h2>
        <addFriend/>
        <receivingFriend/>
        <friendRequests/>
        <invitToPlay/>
        <receivingInvitToPlay/>
        <seeDmRoom/>
    </div>
</template>

<script>
import addFriend from '../utilsChatDm/addFriend';
import receivingFriend from '../utilsChatDm/receivingFriend';
import friendRequests from '../utilsChatDm/friendRequests';
import invitToPlay from '../utilsChatDm/invitToPlay';
import receivingInvitToPlay from '../utilsChatDm/receivingInvitToPlay';
import seeDmRoom from './seeDmRoom';

export default {
    components: { addFriend, receivingFriend, invitToPlay, friendRequests, receivingInvitToPlay, seeDmRoom },
};
</script>
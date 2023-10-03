<template>
    <div>
        <h2>C H A T </h2>
        <addFriend/>
        <receivingFriend/>
        <friendRequests/>
        <invitToPlay/>
        <receivingInvitToPlay/>
        <createChatRoom/>
        <availableRoom/>
        <roomChat/>
    </div>
</template>

<script>
import addFriend from '../utilsChatDm/addFriend';
import receivingFriend from '../utilsChatDm/receivingFriend';
import friendRequests from '../utilsChatDm/friendRequests';
import invitToPlay from '../utilsChatDm/invitToPlay';
import receivingInvitToPlay from '../utilsChatDm/receivingInvitToPlay';
import createChatRoom from './createChatRoom';
import availableRoom from './availableRoom';
import roomChat from './roomChat';

export default {
    components: { addFriend, receivingFriend, invitToPlay, friendRequests, receivingInvitToPlay, createChatRoom, availableRoom, roomChat },
};
</script>
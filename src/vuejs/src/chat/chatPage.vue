<template>
    <div>
        <addFriend/>
        <receivingFriend/>
        <friendRequests/>
        <invitToPlay/>
        <receivingInvitToPlay/>
        <createChatRoom/>
        <receivingPrivateRoom/>
        <availableRoom/>
        <roomChat/>
        <BannedPopup/>
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
import BannedPopup from './bannedPopup';
import receivingPrivateRoom from '../utilsChatDm/receivingPrivateRoom';

export default {
    components: { addFriend, receivingFriend, invitToPlay, friendRequests, receivingInvitToPlay, createChatRoom, availableRoom, roomChat,
        receivingPrivateRoom, BannedPopup },
};
</script>
<template>
    <div>
        <friendRequests/>
        <addFriend/>
        <receivingFriend/>
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
import store from '@/store';
import router from '@/router';
import { onMounted } from 'vue';

export default {
    components: { addFriend, receivingFriend, invitToPlay, friendRequests, receivingInvitToPlay, seeDmRoom },
    setup() {
        onMounted(() => {
            store.getters.gameSocket.on('goToGame', () => {
            router.push('/game');
            });
        });
    }

};
</script>
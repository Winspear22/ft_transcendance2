<template>
    <div class="center-container">
        <friendRequests class="centered-item"/>
        <addFriend class="centered-item"/>
        <receivingFriend/>
        <invitToPlay class="centered-item"/>
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

<style scoped>
.center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh; /* Ajustez la hauteur en fonction de vos besoins */
}

.centered-item {
    margin: 10px 0; /* Ajustez la marge selon vos préférences */
}
</style>

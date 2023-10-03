<template>
    <div>
        <h2>C H A T </h2>
        <addFriend/>
        <receivingFriend/>
        <createChatRoom/>
        <availableRoom/>
    </div>
</template>

<script>
import addFriend from '../utilsChatDm/addFriend';
import receivingFriend from '../utilsChatDm/receivingFriend';
import createChatRoom from './createChatRoom';
import availableRoom from './availableRoom';

export default {
    components: { addFriend, receivingFriend, createChatRoom, availableRoom },
};
</script>
<template>
    <div>
        <h2>D M</h2>
        <addFriend/>
        <receivingFriend/>
    </div>
</template>

<script>
import addFriend from '../utilsChatDm/addFriend';
import receivingFriend from '../utilsChatDm/receivingFriend';

export default {
    components: { addFriend, receivingFriend },
};
</script>
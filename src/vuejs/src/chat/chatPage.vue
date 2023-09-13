<template>
  <div class= "chat-container">
    <h1>C H A T</h1>
    <add-friend></add-friend>
    <receiving-friend></receiving-friend>
    <seeDm></seeDm>
  </div>
</template>

<script>
import AddFriend from './addFriend';
import receivingFriend from './receivingFriend';
import seeDm from './seeDm';

export default {
  name: 'ChatContainer',
  components: {
      AddFriend,
      receivingFriend,
      seeDm,
  }
};
</script>

<style scoped>
</style>

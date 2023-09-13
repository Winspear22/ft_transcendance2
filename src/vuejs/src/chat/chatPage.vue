<template>
  <div class= "chat-container">
    <h1>C H A T</h1>
    <add-friend></add-friend>
    <receiving-friend></receiving-friend>
  </div>
</template>

<script>
import AddFriend from './addFriend';
import receivingFriend from './receivingFriend';

export default {
  name: 'ChatContainer',
  components: {
      AddFriend,
      receivingFriend
  }
};
</script>

<style scoped>
</style>

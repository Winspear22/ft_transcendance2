<template>
    <div class= "home-container">
      <ListFriend></ListFriend>
      <ListOnline></ListOnline>
      <ReceivingFriend></ReceivingFriend>
    </div>
</template>

<script>
import ListFriend from './listFriend';
import ListOnline from './listOnline';
import ReceivingFriend from '../utilsChatDm/receivingFriend.vue';

export default {
  name: 'home-container',
  components: {
    ListFriend,
    ListOnline,
    ReceivingFriend,
  },
};
</script>

<style>
.home-container {
    display: flex; 
    justify-content: space-between;
    align-items: center; 
    height: 100vh; 
}
</style>
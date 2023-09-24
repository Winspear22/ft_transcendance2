<template>
    <div class= "home-container">
      <ListFriend></ListFriend>
      <ListOnline></ListOnline>
      <seeMatchHistory></seeMatchHistory>
    </div>
</template>

<script>
import ListFriend from './listFriend';
import ListOnline from './listOnline';
import seeMatchHistory from './seeMatchHistory.vue';

export default {
  name: 'home-container',
  components: {
    ListFriend,
    ListOnline,
    seeMatchHistory
  },
};
</script>

<style>
.home-container {
    display: flex; 
    justify-content: space-between; 
}
</style>
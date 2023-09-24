<template>
    <div class= "home-container">
      <ListFriend></ListFriend>
      <ListOnline></ListOnline>
    </div>
</template>

<script>
import ListFriend from './listFriend';
import ListOnline from './listOnline';

export default {
  name: 'home-container',
  components: {
    ListFriend,
    ListOnline,
  },
};
</script>

<style>
.home-container {
    display: flex; 
    justify-content: space-between; 
}
</style>
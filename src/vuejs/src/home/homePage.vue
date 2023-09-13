<template>
    <div class= "home-container">
      <h1>H O M E</h1>
      <see-friend></see-friend>
    </div>
</template>

<script>
import seeFriend from './seeFriend';

export default {
  name: 'home-container',
  components: {
    seeFriend,
  },
};
</script>
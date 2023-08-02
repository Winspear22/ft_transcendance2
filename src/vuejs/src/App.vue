<template>
  <div id="app" class="container">
    <displayPong></displayPong>
    <mainUser class="centered-status"></mainUser>
  </div>
</template>

<script>
import mainUser from './components/mainUser.vue';
import displayPong from './components/displayPong.vue';

export default {
  components: {
    displayPong,
    mainUser
  }
};
</script>

<style>
body {
  background: linear-gradient(to right, #2459d5 50%, #2fe8ee 50%);
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.centered-status {
  margin: auto;
}
</style>
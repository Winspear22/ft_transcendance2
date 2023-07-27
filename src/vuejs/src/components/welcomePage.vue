<template>
  <div id="app" class="container">
    <h1 class="centered-title">
      <span class="part-one">P O</span>
      <span class="part-two"> N G</span>
    </h1>
    <statusUser class="centered-status"></statusUser>
  </div>
</template>

<script>
import statusUser from './statusUser.vue';

export default {
  components: {
    statusUser
  },
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

.centered-title {
  text-align: center;
}

.part-one {
  color: #2fe8ee;
}

.part-two {
  color: #2459d5;
}

.centered-status {
  margin: auto;
}
</style>
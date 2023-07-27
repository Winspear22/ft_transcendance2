<template>
  <div id="app">
    <welcomePage></welcomePage>
  </div>
</template>

<script>
import welcomePage from './components/welcomePage.vue';

export default {
  components: {
    welcomePage
  }
};
</script>

<style scoped>
body {
  background: linear-gradient(to right, #2459d5 50%, #2fe8ee 50%);
}
</style>
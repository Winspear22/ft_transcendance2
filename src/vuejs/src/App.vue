<template>
  <div id="app">
    <welcomePage @login="handleLoginSuccess" v-if="!isLoggedIn"></welcomePage>
    <p v-if="isLoggedIn">Vous êtes connecté</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import welcomePage from './components/welcomePage.vue';

export default {
  components: {
    welcomePage
  },
  setup() {
    const isLoggedIn = ref(false);

    function handleLoginSuccess() {
      isLoggedIn.value = true;
    }

    return { isLoggedIn, handleLoginSuccess }
  }
};
</script>


<style scoped>

body {
  background: linear-gradient(to right, #BA55D3 50%, #7B68EE 50%);
}

</style>

<template>
  <div>
    <button @click="login">Se connecter</button>
    <p v-if="errorMessage.value">{{ errorMessage.value }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const errorMessage = ref('');

    function login() {
      window.location.href = 'http://localhost:3000/42/login';
    }

    return {
      errorMessage,
      login
    };
  }
};
</script>

<template>
  <div>
    <button @click="login" class="login-btn">
      <span>se connecter</span>
    </button>
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

<style scoped>
.login-btn {
  padding: 0;
  border: none;
  cursor: pointer;
  font-size: 16px;
  background: transparent;
  color: #2fe8ee;  /* Pour que le texte soit visible sur fond transparent */
  transition: 0.3s; /* transition effet de survol*/
  margin-top: 150px;
}
.login-btn:hover {
  background-color: #2459d5;
}
</style>
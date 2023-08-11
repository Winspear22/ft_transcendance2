<template>
    <div>
      <button @click="login" class="login-btn">
        <span>Se connecter</span>
      </button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const errorMessage = ref('');

    function login() {
      window.location.href = 'http://localhost:3000/auth/42/login';
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
    color: #2fe8ee;
    transition: 0.3s;
    margin-top: 150px;
  }
  
  .login-btn:hover {
    background-color: #2459d5;
  }
  </style>
  
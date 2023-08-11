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
div {
  /* ajouté pour centrer le contenu */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* pour occuper toute la hauteur de la fenêtre de visualisation */
}

.login-btn {
  padding: 0;
  border: none;
  cursor: pointer;
  font-size: 16px;
  background: transparent;
  color: #2fe8ee;
  transition: 0.3s;
}

.login-btn:hover {
  background-color: #2459d5;
}
</style>
  
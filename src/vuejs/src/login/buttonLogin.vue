<template>
  <div class="container">
    <button @click="login" class="login-btn">
      <span>Se connecter</span>
    </button>
  </div>
</template>

<script>
export default {
  setup() {
    function login() {
      window.location.href = 'http://made-f0cr5s6:3000/auth/42/login';
    }

    return {
      login
    };
  }
};

</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-btn {
  border: none;
  cursor: pointer;
  font-size: 16px;
  background: transparent;
  color: #2fe8ee;
  transition: 0.3s;
}

.login-btn:hover {
  color: #000000; 
}
</style>
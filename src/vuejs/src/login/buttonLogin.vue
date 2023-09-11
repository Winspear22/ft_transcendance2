<template>
    <div>
      <button @click="login" class="login-btn">
        <span>Se connecter</span>
      </button>
    </div>
</template>

<script>
export default {
  setup() {
    function login() {
      window.location.href = 'http://localhost:3000/auth/42/login';
    }

    return {
      login
    };
  }
};

</script>

<style scoped>
.login-btn {
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
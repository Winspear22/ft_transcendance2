<template>
  <div>
    <button class ="dual-color-button" @click="login">
      <span class="log-one">se con</span>
      <span class="log-two">necter</span>
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
.dual-color-button {
  background: linear-gradient(to right, #2459d5 50%, #2fe8ee 50%);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 30px;
}

.log-two {
  color: #2459d5;
}

.log-one {
  color: #2fe8ee;
}
</style>

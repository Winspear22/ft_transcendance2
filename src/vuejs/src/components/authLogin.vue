<template>
  <div>
    <button class ="dual-color-button" @click="login">
	<span class="log-one">Se con</span>
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
  background: linear-gradient(to right, #BA55D3 50%, #7B68EE 50%);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 30px;
}

.log-two {
  color: #BA55D3;
}

.log-one {
  color: #7B68EE;
}
</style>

<template>
  <div class="login-container">
      <buttonLogin></buttonLogin>
      <checkAuth @requireTwoFa="showTwoFa = true" />
      <twoFa v-if="showTwoFa" />
  </div>
</template>

<script>
import { ref } from 'vue';
import buttonLogin from './ButtonLogin';
import checkAuth from './CheckAuth';
import twoFa from './TwoFa';

export default {
  components: {
      buttonLogin,
      checkAuth,
      twoFa
  },
  setup() {
      const showTwoFa = ref(false);

      return { showTwoFa };
  }
};
</script>
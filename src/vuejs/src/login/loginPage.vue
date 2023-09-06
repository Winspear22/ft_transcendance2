<template>
  <div class="login-container">
      <buttonLogin></buttonLogin>
      <checkAuth/>
  </div>
</template>

<script>
import buttonLogin from './ButtonLogin';
import checkAuth from './CheckAuth';

export default {
  components: {
      buttonLogin,
      checkAuth,
  },
};
</script>
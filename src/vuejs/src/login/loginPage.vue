<template>
  <div class="login-container">
      <buttonLogin></buttonLogin>
      <checkAuth/>
  </div>
</template>

<script>
import buttonLogin from './buttonLogin';
import checkAuth from './checkAuth';

export default {
  components: {
      buttonLogin,
      checkAuth,
  },
};
</script>
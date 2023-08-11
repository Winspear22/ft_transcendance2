<template>
  <div id="app" class="container">
    <loginPage v-if="!isUserLoggedIn" @info-user="updateUserInfo"></loginPage>
  </div>
</template>

<script>
import loginPage from './login/loginPage.vue';

export default {
  components: {
    loginPage
  },
  data() {
    return {
      isUserLoggedIn: false,
      infoUser: null
    };
  },
  methods: {
    updateUserInfo(data) {
      this.isUserLoggedIn = data.isUserLoggedIn;
      this.infoUser = data.infoUser;
    }
  },
};
</script>

<style>
body {
  margin: 0;
  height: 100%;
  background: linear-gradient(to right, #2459d5 20%, #2fe8ee 80%);
}
</style>
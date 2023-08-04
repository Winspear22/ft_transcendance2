<template>
  <div id="app" class="container">
    <loginPage v-if="!isUserLoggedIn" @info-user="updateUserInfo"></loginPage>
    <welcomePage v-else :userData="infoUser"></welcomePage>
  </div>
</template>

<script>
import loginPage from './login/loginPage.vue';
import welcomePage from './welcome/welcomePage.vue';

export default {
  components: {
    loginPage,
    welcomePage
  },
  data() {
    return {
      isUserLoggedIn: false
    };
  },
  methods: {
    updateUserInfo(data) {
      this.isUserLoggedIn = data.isUserLoggedIn,
      this.infoUser = data.infoUser
    }
  }
};
</script>

<style>
</style>
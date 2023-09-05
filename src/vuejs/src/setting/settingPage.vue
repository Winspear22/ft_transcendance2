<template>
  <div class="setting-container">
    <infoUser @userInfoFetched="handleUserInfo"></infoUser>
    <buttonQrcode :userInfo="userInformation"></buttonQrcode>
    <buttonLogout></buttonLogout>
  </div>
</template>

<script>
import buttonLogout from './ButtonLogout';
import infoUser from './InfoUser.vue';
import buttonQrcode from './ButtonQrcode.vue';

export default {
  components: {
      buttonLogout,
      infoUser,
      buttonQrcode,
  },
  data() {
    return {
      userInformation: null,
    };
  },
  methods: {
    handleUserInfo(userInfo) {
      this.userInformation = userInfo;
    },
  },
};
</script>
<template>
  <div class="setting-container">
    <infoUser @userInfoFetched="handleUserInfo" />
    <profilePicture :userPic="userProfilePic" />
    <displayUser v-if="userInfo" :userInfo="userInfo" />
    <buttonQrcode v-if="userInfo" :userInfo="userInfo" />
    <buttonLogout></buttonLogout>
  </div>
</template>

<script>
import infoUser from './infoUser.vue';
import buttonLogout from './buttonLogout';
import displayUser from './displayUser.vue';
import buttonQrcode from './buttonQrcode.vue';
import profilePicture from './profilePicture';

export default {
  components: {
      buttonLogout,
      profilePicture,
      infoUser,
      displayUser,
      buttonQrcode
  },
  data() {
      return {
          userProfilePic: null,
          userInfo: null
      };
  },
  methods: {
      handleUserInfo(receivedUserInfo) {
          this.userInfo = receivedUserInfo;
      },
  },
};
</script>

<style>
.setting-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
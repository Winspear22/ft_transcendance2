<template>
  <div class="setting-container">
    <infoUser @userInfoFetched="handleUserInfo"></infoUser>
    <displayPP :userInfo="userInformation"></displayPP>
    <buttonQrcode :userInfo="userInformation"></buttonQrcode>
    <buttonLogout></buttonLogout>
    <router-link :to="{ name: 'ProfileModification' }">Modifier le profil</router-link>
  </div>
</template>


<script>
import infoUser from './InfoUser.vue';
import displayPP from './DisplayPP.vue'; 
import buttonLogout from './ButtonLogout';
import buttonQrcode from './ButtonQrcode.vue';

export default {
  components: {
      buttonLogout,
      infoUser,
      buttonQrcode,
      displayPP, 
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
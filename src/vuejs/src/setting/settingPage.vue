<template>
  <div class="setting-container">
    <infoUser @userInfoFetched="handleUserInfo"></infoUser>
    <displayPP :userInfo="userInformation"></displayPP>
    <div v-if="userInformation">
      <p>{{ userInformation.username }}</p> 
      <p>{{ userInformation.email }}</p> 
    </div>
    <buttonQrcode :userInfo="userInformation"></buttonQrcode>
    <buttonLogout></buttonLogout>
    <router-link :to="{ name: 'ProfileModification' }">Modifier le profil</router-link>
  </div>
</template>


<script>
import infoUser from './infoUser.vue';
import displayPP from './DisplayPP.vue'; 
import buttonLogout from './buttonLogout';
import buttonQrcode from './buttonQrcode.vue';

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
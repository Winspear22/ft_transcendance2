<template>
  <div class="setting-container">
    <infoUser @userInfoFetched="handleUserInfo"></infoUser>
    <displayPP :userInfo="userInformation"></displayPP>
    <div v-if="userInformation">
      <p>{{ userInformation.username }}</p> 
      <p>{{ userInformation.email }}</p> 
    </div>
    <div v-if="uMatchHistory">
      <p>Total Parties: {{ uMatchHistory.total_parties }}</p>
      <p>Total Victoires: {{ uMatchHistory.total_victoire }}</p>
      <p>Total Défaites: {{ uMatchHistory.total_défaite }}</p>
      <p>Winrate: {{ uMatchHistory.winrate }}%</p>
    </div>
    <buttonQrcode class="spacing" :userInfo="userInformation"></buttonQrcode>
    <router-link class="spacing" :to="{ name: 'ProfileModification' }">Modifier le profil</router-link>
    <buttonLogout></buttonLogout>
  </div>
</template>


<script>
import infoUser from './infoUser.vue';
import displayPP from './DisplayPP.vue'; 
import buttonLogout from './buttonLogout';
import buttonQrcode from './buttonQrcode.vue';
import router from '@/router';
import store from '@/store';
import { ref, onMounted } from 'vue';

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
  setup() {
    const uMatchHistory = ref();
    onMounted(() => {
        store.getters.gameSocket.emit('matchHistory');
        store.getters.gameSocket.on('matchHistory', (matchHistory) => {
            uMatchHistory.value = matchHistory;
            console.log("matchHistory ", uMatchHistory);
        });
        store.getters.gameSocket.on('goToGame', () => {
            router.push('/game');
        });
    });
    return {
      uMatchHistory,
    };

  },
  methods: {
    handleUserInfo(userInfo) {
      this.userInformation = userInfo;
    },
  },
};
</script>

<style>
.setting-container {
    display: flex;
    flex-direction: column;
    align-items: center; 
    justify-content: center; 
    text-align: center; 
    color: #2fe8ee;
    font-family: 'Arial', sans-serif;
    font-size: 16px;
}

.setting-container a {
    text-align: center;
    width: 100%;
    color: #2fe8ee;
    text-decoration: none; 
    font-size: inherit; 
}

.setting-container a:hover {
    color: #000000; 
}

.spacing {
    margin-top: 10px;
}
.setting-container p:last-of-type { 
    margin-bottom: 10px; 
}

.setting-container .buttonQr-container {
    margin-top: 0;
}

</style>
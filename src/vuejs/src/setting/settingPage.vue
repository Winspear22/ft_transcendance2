<template>
  <div class="setting-container">
    <infoUser @userInfoFetched="handleUserInfo"></infoUser>
    <displayPP :userInfo="userInformation"></displayPP>
    <div v-if="userInformation">
      <p>{{ userInformation.username }}</p> 
      <p>{{ userInformation.email }}</p> 
    </div>
    <buttonQrcode :userInfo="userInformation"></buttonQrcode>
    <router-link :to="{ name: 'ProfileModification' }">Modifier le profil</router-link>
    <buttonLogout></buttonLogout>
  </div>
</template>


<script>
import infoUser from './infoUser.vue';
import displayPP from './DisplayPP.vue'; 
import buttonLogout from './buttonLogout';
import buttonQrcode from './buttonQrcode.vue';
// import router from '@/router';
// import store from '@/store';
// import { onMounted } from 'vue';

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
    // onMounted(() => {
      // store.getters.gameSocket.on('goToGame', () => {
                // router.push('/game');
            // })
    // }) 
  },
  methods: {
    handleUserInfo(userInfo) {
      this.userInformation = userInfo;
    },
  },
};
</script>

<style scoped>
.setting-container {
    display: flex;
    flex-direction: column;
    align-items: center; /* Centrer horizontalement */
    justify-content: center; /* Centrer verticalement */
    text-align: center; /* Centrer le texte à l'intérieur de chaque élément */
    color: #2fe8ee; /* Changement de la couleur du texte à bleu */
}

/* Centrage et couleur du contenu du lien router */
.setting-container a {
    text-align: center;
    width: 100%;
    color: #2fe8ee; /* Changement de la couleur du lien à bleu */
    text-decoration: none; /* Si vous souhaitez supprimer le soulignement des liens */
}

/* Changement de la couleur du lien lors du survol */
.setting-container a:hover {
    color: #000000; /* Changement de la couleur à noir lorsque la souris passe dessus */
}

</style>
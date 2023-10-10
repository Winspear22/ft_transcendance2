<template>
  <div>
    <!-- La pop-up -->
    <div v-if="showPopup">
      Bienvenue! C'est votre première connexion.
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useStore } from 'vuex';

export default {
  name: 'infoUser',
  data() {
    return {
      userInfo: null,
      showPopup: false,
    };
  },
  created() {
    this.fetchUserInfo();
  },
  methods: {
          if (this.userInfo.user_status === "online" && store.getters.firstConnection) {

            // Après avoir affiché la pop-up, définissez firstConnection sur false
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
      }
    },
  },
};
</script>

<template>
    <div>
    </div>
</template>
  
<script>
  import axios from 'axios';
  
  export default {
    name: 'infoUser',
    data() {
      return {
        userInfo: null,
      };
    },
    created() {
      this.fetchUserInfo();
    },
    methods: {
      async fetchUserInfo() {
        try {
          const response = await axios.get('http://localhost:3000/auth/getUserInfo', { withCredentials: true });
          if (response.data.success) {
            this.userInfo = response.data.user;
            console.log(this.userInfo);
            this.$emit('userInfoFetched', this.userInfo);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des informations utilisateur:', error);
        }
      },
    },
  };
  </script>
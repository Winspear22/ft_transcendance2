<template>
    <div>
        <displayPong></displayPong>
        <userData @user-data="handleUserData" />
        <loginButton v-if="!isUserLoggedIn" />
    </div>
</template>

<script>
    import userData from '../components/userData.vue'
    import loginButton from './loginButton.vue'
    import displayPong from '../components/displayPong.vue'

    export default {
        data() {
            return {
                isUserLoggedIn: false
            };
        },
        components: {
            displayPong,
            userData,
            loginButton
        },
        methods: {

        handleUserData(data) {
            this.isUserLoggedIn = data.isLoggedIn;
            console.log('Received from UserData component:', data);
            this.$emit('info-user', {
                isLoggedIn: data.isLoggedIn,
                infoUser: data.infoUser
            });
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

div { /* ou utilisez une classe spécifique pour cibler cette div si vous préférez */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: space-around;
  height: 100%; /* cette propriété assure que la div prend toute la hauteur de la fenêtre */
}
</style>
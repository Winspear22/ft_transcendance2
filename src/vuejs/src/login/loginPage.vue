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
            this.$emit('info-user', {
                isLoggedIn: data.isLoggedIn,
                infoUser: data.infoUser
            });
        }
        },
    };
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: space-around;
  height: 100%; /* cette propriété assure que la div prend toute la hauteur de la fenêtre */
}
</style>
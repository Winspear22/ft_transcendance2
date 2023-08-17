<template>
    <div class="login-container">
        <buttonLogin></buttonLogin>
        <checkAuth></checkAuth>
    </div>
</template>

<script>
import buttonLogin from './buttonLogin';
import checkAuth from './checkAuth';
//import recoveryToken from './recoveryToken';
//import faLogin from './faLogin';

export default {
    components: {
        buttonLogin,
        checkAuth
//        recoveryToken,
//        faLogin
    },
//    computed: {
//        isTwoAuthActive() {
//            return this.$store.state.twoFaActivated;
//        }
//    }
};
</script>
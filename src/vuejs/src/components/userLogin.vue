<template>
    <div>
        <authLogin :userInfo="userInfo" @login-success="login"></authLogin>
    </div>
</template>

<script>
import authLogin from './authLogin.vue';
export default {
    components : {
        authLogin
    },
    props: ['userInfo'],
    methods: {
        login() {
            this.$emit('login');
        }
    }
};
</script>
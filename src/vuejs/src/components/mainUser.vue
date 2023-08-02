<template>
    <div>
        <userStatusChecker @status-checked="handleStatusChecked"></userStatusChecker>

        <displayAll v-if="isLoggedIn" 
                  :userInfo="userInfo" 
                  @logout="handleLogout">
        </displayAll>

        <userLogin v-else @login="handleLogin"></userLogin>
    </div>
</template>

<script>
import { ref } from 'vue';
import userLogin from './userLogin.vue';
import displayAll from './displayAll.vue';
import userStatusChecker from './userStatusChecker.vue';

export default {
    components: {
        userLogin,
        displayAll,
        userStatusChecker
    },
    setup() {
        const isLoggedIn = ref(false);
        const userInfo = ref(null);

        function handleStatusChecked(event) {
            isLoggedIn.value = event.isLoggedIn;
            userInfo.value = event.userInfo;
        }

        function handleLogin() {
            isLoggedIn.value = true;
        }

        function handleLogout() {
            isLoggedIn.value = false;
        }

        return { isLoggedIn, handleLogin, handleLogout, userInfo, handleStatusChecked };
    }
};
</script>

<style scoped>
body {
  background: linear-gradient(to right, #2459d5 50%, #2fe8ee 50%);
}
</style>

<template>
    <div class="setting-container">
        <displayPong></displayPong>
        <userInfo @userInfo="handleUserInfo"/>
        <userDisplay :infoUser="userData"/>
        <displayQrcode v-if="userData" :userData="userData"/>
    </div>
</template>

<script>
import displayPong from './displayPong';
import userInfo from './userInfo';
import userDisplay from './userDisplay';
import displayQrcode from './displayQrcode'; 

export default {
    components: {
        displayPong,
        userInfo,
        userDisplay,
        displayQrcode
    },
    data() {
        return {
            userData: null 
        };
    },
    methods: {
        handleUserInfo(data) {
            this.userData = data.infoUser;
            console.log(this.userData);
        }
    }
};
</script>

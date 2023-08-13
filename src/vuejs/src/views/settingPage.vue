<template>
    <div class="setting-container">
        <displayPong></displayPong>
        <userInfo @userInfo="handleUserInfo"/>
        <userDisplay :infoUser="userData"/>
        <displayQrcode v-if="userData" :userId="userData.id"/>
    </div>
</template>

<script>
import displayPong from './displayPong';
import userInfo from './userInfo';
import userDisplay from './userDisplay';  // Importez le composant UserDisplay
import displayQrcode from './displayQrcode';  // Importez le composant UserDisplay

export default {
    components: {
        displayPong,
        userInfo,
        userDisplay,
        displayQrcode
    },
    data() {
        return {
            userData: null  // initialisation de userData à null
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

<template>
    <div class="buttonQr-container">
      <div class="header">
        <div class="title">{{ isTwoFaActivated ? 'Désactivation 2FA' : 'Activation 2FA   ' }}</div>
        <generateQr v-if="!isTwoFaActivated" :userInfo="userInfo" @qrCodeGenerated="handleQrCode"></generateQr>
        <deactivateQr v-if="isTwoFaActivated" @resetQrCode="qrCodeUrl = null"></deactivateQr>
        <displayQr :qrCodeUrl="qrCodeUrl"></displayQr>
      </div>
    </div>
</template>

<script>
import generateQr from './generateQr.vue';
import deactivateQr from './deactivateQr.vue';
import displayQr from './displayQr.vue';
import { mapGetters } from 'vuex';

export default {
    name: 'buttonQrcode',
    components: {
        generateQr,
        deactivateQr,
        displayQr
    },
    data() {
        return {
            qrCodeUrl: null
        };
    },
    props: {
        userInfo: {
            type: Object,
            default: null
        }
    },
    computed: {
        ...mapGetters(['isTwoFaActivated'])
    },
    methods: {
        handleQrCode(qrCode) {
            this.qrCodeUrl = qrCode;
        }
    }
}
</script>

<style scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: center;
}


</style>
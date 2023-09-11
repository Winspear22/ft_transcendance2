<template>
    <div class="buttonQr-container">
      <div class="header">
        <div class="title">{{ isTwoFaActivated ? 'Désactivation 2FA' : 'Activation 2FA' }}</div>
        <generateQr v-if="!isTwoFaActivated" :userInfo="userInfo" @qrCodeGenerated="handleQrCode"></generateQr>
        <deactivateQr v-if="isTwoFaActivated"></deactivateQr>
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

.title {
    font-size: 14px;
    margin-right: 10px;
}

.toggle-button {
    width: 40px;
    height: 20px;
    background-color: #2fe8ee;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
}

.slider {
    position: absolute;
    top: 50%;
    left: 2px;
    width: 16px;
    height: 16px;
    background-color: #2459d5;
    border-radius: 50%;
    transition: all 0.4s;
    transform: translateY(-50%);
}

.toggle-button.activated {
    background-color: #2459d5;
}

.toggle-button.activated .slider {
    left: 22px;
    background-color: #2fe8ee;
}
</style>%
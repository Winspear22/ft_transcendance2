<template>
    <div class="generateQr-container">
        <div class="toggle-button" :class="{ 'activated': isTwoFaActivated && qrCodeUrl }" @click="generateTwoFa">
            <div class="slider"></div>
        </div>
        <img v-if="showQrImage && qrCodeUrl" :src="qrCodeUrl" alt="QR Code"/>
        <div>
            isTwoFaActivated: {{ isTwoFaActivated }}
            <br>
            qrCodeUrl: {{ qrCodeUrl }}
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            qrCodeUrl: null,
            showQrImage: false
        };
    },
    computed: {
        ...mapGetters(['isTwoFaActivated'])
    },
    updated() {
        if (this.qrCodeUrl) {
            this.showQrImage = true;
        }
    },
    methods: {
        ...mapActions(['activateTwoFa']), 
        async generateTwoFa() {
            try {
                const response = await axios.post('http://localhost:3000/auth/generate', {}, {withCredentials: true});
                this.qrCodeUrl = response.data.qrCode;
                this.showQrImage = true;
                this.activateTwoFa(true);
            } catch (error) {
                this.showQrImage = false;
                console.error("Erreur lors de la génération du QR Code:", error);
            }
        }
    }
}
</script>


<style scoped>
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
</style>
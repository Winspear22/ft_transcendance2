<template>
    <div class="qr-container">
        <div v-if="secret">Secret {{ secret }}</div>
        <img v-if="qrCode" :src="qrCode" alt="QR Code" class="qr-image" />
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            qrCode: null,
            secret: null  
        };
    },
    props: {
        userId: {
            type: [String, Number],
            required: true
        }
    },
    async created() {
        try {
            const response = await axios.post(
                'http://localhost:3000/generate',
                { userId: this.userId },
                { withCredentials: true }
            );
            
            this.qrCode = response.data.qrCode;
            this.secret = response.data.secret;

            console.log("si j'affiche data de QRCODE", response.data.secret);
        } catch (error) {
            console.error("Erreur lors de la génération du QR Code:", error);
        }
    }
};
</script>

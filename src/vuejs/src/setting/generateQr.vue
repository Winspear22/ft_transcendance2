<template>
    <div class="generateQr-container">
        <div class="toggle-button" @click="generateTwoFa">
            <div class="slider"></div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {};
    },
    methods: {
        async generateTwoFa() {
            try {
                const response = await axios.post('http://localhost:3000/auth/generate', {}, {withCredentials: true});
                this.$emit('qrCodeGenerated', response.data.qrCode); // Émission de l'événement
            } catch (error) {
                console.error("Erreur lors de la génération du QR Code:", error);
            }
        }
    }
}
</script>

<style scoped>
.toggle-button {
    width: 30px;           /* réduit de 40px à 30px */
    height: 15px;          /* réduit de 20px à 15px */
    background-color: #2fe8ee;
    border-radius: 7.5px;  /* réduit de 10px à 7.5px (c'est la moitié de la hauteur) */
    position: relative;
    cursor: pointer;
}

.slider {
    position: absolute;
    top: 50%;
    left: 1.5px;           /* ajusté proportionnellement */
    width: 12px;           /* réduit de 16px à 12px */
    height: 12px;          /* réduit de 16px à 12px */
    background-color: #2459d5;
    border-radius: 50%;
    transition: all 0.4s;
    transform: translateY(-50%);
}

.toggle-button.activated {
    background-color: #2459d5;
}

.toggle-button.activated .slider {
    left: 16.5px;          /* ajusté proportionnellement */
    background-color: #2fe8ee;
}
</style>

<template>
    <div class="centered-container">
        <!-- Titre 2FA et bouton à coulisser -->
        <div class="header">
            <div v-if="!checkDisplay" class="title">Activation 2FA</div>
            <div v-else class="title">Désactivation 2FA</div>

            <!-- Toggle Button avec transition -->
            <div class="button-container" @click="toggleChange">
                <div class="slider-button" :class="{ 'moved': checkDisplay }"></div>
            </div>
        </div>

        <!-- QR Code -->
        <div class="qr-container">
            <img v-if="checkDisplay && qrcodeData" :src="qrcodeData" alt="User's QR Code" />
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    props: {
        userId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            qrcodeData: null,
            checkDisplay: false
        };
    },

    async created() {
        const storedState = localStorage.getItem('buttonState');
        if (storedState !== null) {
            this.checkDisplay = storedState === 'true'; // Convertir la chaîne en booléen
        }
        
        if (this.checkDisplay && !this.qrcodeData) {
            try {
                const response = await axios.post('http://localhost:3000/auth/generate', { userId: this.userId }, { withCredentials: true });
                this.qrcodeData = response.data.qrCode;
            } catch (error) {
                console.error("Erreur lors de la génération du QR code:", error);
            }
        }
    },

    methods: {
        async toggleChange() {
            this.checkDisplay = !this.checkDisplay;
            if (this.checkDisplay && !this.qrcodeData) {
                try {
                    const response = await axios.post('http://localhost:3000/auth/generate', { userId: this.userId }, { withCredentials: true });
                    this.qrcodeData = response.data.qrCode;
                } catch (error) {
                    console.error("Erreur lors de la génération du QR code:", error);
                }
            }
        }
    },

    watch: {
        checkDisplay(newValue) {
            localStorage.setItem('buttonState', newValue);
        }
    }
};
</script>


<style scoped>
.centered-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%; /* ou une hauteur spécifique si nécessaire */
}

.header {
    display: flex;
    align-items: center;
    justify-content: center;
}

.button-container {
    width: 50px;
    height: 25px;
    background-color: #ddd;
    position: relative;
    border-radius: 12.5px;
    cursor: pointer;
    margin-left: 15px;
}

.slider-button {
    width: 23px;
    height: 23px;
    background-color: #2fe8ee;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 1px;
    transition: left 0.4s;
}

.slider-button.moved {
    left: 26px;
}

.title {
    font-size: 16px;
    color: #2fe8ee;
}

.qr-container {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    margin-top: 20px;
}
</style>

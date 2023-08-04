<template>
    <div>

        <!-- Titre 2FA -->
        <div v-if="!isChecked" class="title">Activation 2FA</div>
        <div v-else class="title">Désactivation 2FA</div>

        <!-- Toggle Switch -->
        <label class="switch">
            <input type="checkbox" v-model="isChecked" @change="toggleChange">
            <span class="slider"></span>
        </label>

        <!-- QR Code -->
        <div class="qr-container">
            <img v-if="isChecked && qrCode" :src="qrCode" alt="QR Code" class="qr-image" />
        </div>

    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            qrCode: null,
            secret: null,
            isChecked: false
        };
    },
    props: {
    userInfo: {
        type: Object,
        required: true
        }
    },
    async created() {
    try {
        const generateResponse = await axios.post('http://localhost:3000/auth/generate', { userId: this.userInfo.id }, { withCredentials: true });
        
        console.log("APRES GENERATE");
        if (generateResponse.data.qrCode) {
            this.qrCode = generateResponse.data.qrCode;
            this.secret = generateResponse.data.secret;
            
            const turnOnResponse = await axios.post('http://localhost:3000/auth/turn-on', { 
                TfaCode: this.secret,
                login: this.userInfo.username,
                user_id: this.userInfo.id
               }, { withCredentials: true });
               // console.log(turnOnResponse.login, " ", turnOnResponse.user_id);

            console.log("REPONSE TURN_ON ==", turnOnResponse);
            if (turnOnResponse.status !== 200) {
                console.error("Erreur lors de l'activation:", turnOnResponse.statusText);
                this.qrCode = null; 
            }
        } else {
            console.error("QRCode non reçu depuis 'generate'.");
        }
        console.log(this.userInfo.username);
        console.log(this.userInfo.id);
    } 

    catch (error) {
        console.error("Erreur lors des appels API:", error);
    }
}

};
</script>

<style scoped>
.switch {
    position: relative;
    display: inline-block;
    width: 40px; 
    height: 20px; 
    margin-left: 10px;
}

.switch input { 
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #2fe8ee;  
    transition: .4s;
    border-radius: 20px; 
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px; 
    width: 16px; 
    left: 2px;
    bottom: 2px;
    background-color: #2459d5; 
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #2fe8ee;  
}

input:checked + .slider:before {
    background-color: #2459d5;  
    transform: translateX(20px);  
}

.title {
    color: #2fe8ee; 
    display: inline-block;
    font-size: 16px; 
}

.qr-container {
    display: flex;        
    justify-content: center; 
    align-items: center; 
    overflow: hidden; 
}

.qr-container .qr-image {
    max-width: 90%;   
    max-height: 90%;
    display: block;  
}
</style>









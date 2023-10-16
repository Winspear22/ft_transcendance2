<template>
    <div class="deactivate-container">
        <div class="toggle-button-desactivate" @click="deactivateTwoFa">
            <div class="slider"></div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['activateTwoFa']),
        async deactivateTwoFa() {
            try {
                const response = await axios.post('http://made-f0cr5s6:3000/auth/deactivate', {}, {withCredentials: true});
                if (response.status === 200) {
                    this.activateTwoFa(false);
                    this.$emit('resetQrCode');
                }
            } catch (error) {
                console.error("Erreur lors de la désactivation du 2FA:", error);
            }
        }
    }
}
</script>
<style scoped>
.deactivate-container {
    display: inline-block;  /* pour que le container s'adapte à la taille du bouton */
}

.toggle-button-desactivate {
    width: 30px;
    height: 15px;
    background-color: #2fe8ee;
    border-radius: 7.5px;
    position: relative;
    cursor: pointer;
}

.slider {
    position: absolute;
    top: 50%;
    left: 1.5px;
    width: 12px;
    height: 12px;
    background-color: #2459d5;
    border-radius: 50%;
    transition: all 0.4s;
    transform: translateY(-50%);
}

</style>
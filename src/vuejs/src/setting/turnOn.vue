<template>
    <div>
        <infoUser @userInfoFetched="handleUserInfo"></infoUser>
        <div class="popup">
            <div class="popup-content">
                <h3>Valider 2FA</h3>
                <div class="input-container">
                    <input
                        v-for="n in 6"
                        :key="n"
                        type="number"
                        maxlength="1"
                        @input="moveToNextInput($event, n)"
                    />
                </div>
                <button @click="validate">Valider</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import store from '../store';
import InfoUser from './infoUser.vue';

export default {
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    components: {
        InfoUser
    },
    data() {
        return {
            code: '',
            username: '',
            twoFaEnabled: false
        };
    },
    watch: {
        code(newCode) {
        if (newCode.length === 6) {
            this.validate();
            }
        }
    },
    methods: {
        handleUserInfo(userInfo) {
            this.username = userInfo.username;
        },
        closePopup() {
            console.log("close");
            this.$emit('closePopup');
        }, 

        moveToNextInput(event, n) {
            this.code = this.code.slice(0, n-1) + event.target.value + this.code.slice(n);
            if (event.target.value.length === 1 && n < 6) {
                const nextInput = event.target.parentNode.children[n];
                if (nextInput) nextInput.focus();
            } else if (event.target.value.length === 0 && n > 1) {
                const prevInput = event.target.parentNode.children[n - 2]; 
                if (prevInput) prevInput.focus();
            }
        },
        validate() {
            axios.post(process.env.VUE_APP_HOSTNAME + '/auth/turn-on', { TfaCode: this.code, username: this.username }, {withCredentials: true}) // Remplacez 'votreNomDutilisateur' par la valeur appropriée
                .then(response => {
                    if (response.data.message === '2FA enabled') {
                        this.twoFaEnabled = true; 
                        this.$emit('twoFaStatusChanged', this.twoFaEnabled);
                        store.dispatch('activateTwoFa', true);
                    } else {
                        this.errorMessage = response.data.message;
                        this.code = '';
                    }
                })
                .catch(error => {
                    console.error("Une erreur est survenue lors de la validation du code 2FA", error);
                    this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
                });
        }
    }
  }
  </script>

<style scoped>
.popup {
 position: fixed;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background: rgba(0, 0, 0, 0.5);
 display: flex;
 justify-content: flex-start;
 align-items: center;
 padding-top: 20px;
 align-items: flex-start;
}

.popup-content {
 background: #2459d5;
 padding: 20px;
 border-radius: 8px;
 width: 80%;
 max-width: 400px;
}

.input-container {
 display: flex;
 gap: 10px;
 justify-content: space-between;
}

.close-popup {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 24px; 
    z-index: 10;
    background-color: transparent;
}


input {
 width: 30px;
 text-align: center;
 background: #2fe8ee;
 padding: 5px 10px;
 -webkit-appearance: none; /* Pour Chrome et Safari */
 -moz-appearance: textfield; /* Pour Firefox */
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
 -webkit-appearance: none;
 margin: 0;
}


h3 {
 text-align: center;
}

 </style>
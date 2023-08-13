<template>
    <div v-if="showPopup" class="popup-container">
        <div class="popup-content">
            <h3>Entrez le code à 6 chiffres</h3>
            <input type="text" v-model="TfaCode" maxlength="6" />
            <button @click="validateCode">Valider</button>
            <button @click="cancel">Annuler</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    props: {
        userInfo: {
            type: Object,
            required: false,
        }
    },
    data() {
        return {
            showPopup: true,   // Affiche le popup dès le chargement du composant
            TfaCode: ''        // Stocke le code saisi par l'utilisateur
        };
    },
    methods: {
        async validateCode() {
            // Envoyer une requête POST avec les données nécessaires au backend
            try {
                const response = await axios.post('http://localhost:3000/auth/turn-on', {
                    username: this.userInfo.username,
                    TfaCode: this.TfaCode
                }, {
                    withCredentials: true
                });

                // Traiter la réponse comme vous le souhaitez
                if (response.data.success) {
                    this.$emit('codeValidated');
                    this.showPopup = false;
                } else {
                    // Gérer une éventuelle erreur renvoyée par le backend
                    alert('Erreur de validation du code');
                }
            } catch (error) {
                console.error("Erreur lors de la validation du code:", error);
                if (error.response && error.response.data) {
                    console.error("Détails de l'erreur:", error.response.data);
                }
            }
        },
        cancel() {
            this.showPopup = false;
        }
    }
};
</script>



<style scoped>
/* Vous pouvez ajouter des styles pour la fenêtre popup ici */
.popup-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.popup-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    text-align: center;
}
</style>
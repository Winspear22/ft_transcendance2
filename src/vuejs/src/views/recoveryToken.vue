<template>
    <div>
        <!-- Afficher le message d'erreur si défini -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
</template>

<script>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
    setup() {
        const errorMessage = ref(''); 
        const router = useRouter(); // pour naviguer entre les pages
        const store = useStore(); // pour accéder au store de Vuex

        async function fetchToken() {
            try {
                const response = await axios.get('http://localhost:3000/auth/check-auth', { withCredentials: true });

                if (!response.data.success) {
                    console.warn("La vérification d'authentification a échoué.");
                    errorMessage.value = "Une erreur est survenue lors de la vérification de l'authentification. Veuillez réessayer.";
                    return;
                }
                if (response.data.cookie) {
                    let parsedCookie;
                    try {
                        parsedCookie = JSON.parse(response.data.cookie);
                    } catch (error) {
                        console.error("Erreur lors du parsing du cookie:", error);
                        errorMessage.value = "Une erreur interne est survenue. Veuillez recharger la page.";
                        return;
                    }

                    if (parsedCookie && parsedCookie.accessToken) {
                        const accessToken = parsedCookie.accessToken;
                        localStorage.setItem('userToken', accessToken);

                        // Mise à jour du store pour indiquer que l'utilisateur est connecté
                        store.dispatch('setUserAuthentication', true); 

                        // Redirige l'utilisateur vers la page Home
                        router.push({ name: 'Home' });

                    } else {
                        console.warn("accessToken manquant dans le cookie");
                        errorMessage.value = "L'authentification a échoué. Veuillez recharger la page ou réessayer plus tard.";
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du token:", error);
                errorMessage.value = "Une erreur est survenue lors de la connexion au serveur. Veuillez vérifier votre connexion et réessayer.";
            }
        }

        onMounted(() => {
            fetchToken();
        });

        return {
            errorMessage
        };
    }
};
</script>

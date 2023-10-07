<template>
    <div>
        <button @click="logout" class="logout-btn">
            Se déconnecter
        </button>
    </div>
</template>

<script>
import axios from 'axios';
import store from '@/store';
import { useRouter } from 'vue-router';

export default {
    name: 'buttonLogout',
    setup() {
        const router = useRouter();

        async function logout() {
            try {
                const response = await axios.post('http://paul-f4ar5s6:3000/auth/Logout', {}, { withCredentials: true });

                if (response.status === 200) {
                    store.dispatch('authenticate', false);
                    store.dispatch('activateTwoFa', response.data.partialUser.isTwoFactorAuthenticationEnabled);
                    router.push('/');
                }
            } catch (error) {
                console.error("Erreur lors de la déconnexion :", error);
            }
        }

        return {
            logout
        };
    }
}
</script>

<style scooped>
.logout-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: transparent; /* Aucune couleur de fond */
    color: #2fe8ee; /* Couleur de texte bleue */
    cursor: pointer; /* Changement du curseur au survol */
    font-size: 16px;
    transition: color 0.3s; /* Transition douce pour le changement de couleur */
}

.logout-btn:hover {
    color: #000000; /* Changement de la couleur à noir lorsque la souris passe dessus */
}

</style>
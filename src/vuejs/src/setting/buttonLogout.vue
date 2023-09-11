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
                const response = await axios.post('http://localhost:3000/auth/Logout', {}, { withCredentials: true });

                if (response.status === 200) {
                    console.log("OFFLINE", response.data);
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
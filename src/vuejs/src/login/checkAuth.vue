<template>
    <div>
        <turn-on v-if="showTurnOnComponent" @twoFaStatusChanged="handleTwoFaStatus"></turn-on>
        <init-socket v-if="shouldInitSocket"></init-socket>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue'; 
import axios from 'axios';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import turnOn from './../setting/turnOn';
import initSocket from './initSocket';

export default {
    name: 'CheckAuth',
    components: {
        turnOn,
        initSocket,
    },
    setup() {
        const store = useStore();
        const router = useRouter();
        const showTurnOnComponent = ref(false);
        const shouldInitSocket = ref(false);

        onMounted(authenticate);

        async function authenticate() {
            try {
                const response = await axios.get('http://localhost:3000/auth/check-auth', { withCredentials: true });
                if (response.data.success) {
                    if (response.data.cookie) {
                        store.dispatch('setToken', response.data.cookie);
                    }
                    const isAuthenticated = response.data.infoUser.user_status === 'Online';
                    store.dispatch('authenticate', isAuthenticated);
                    store.dispatch('activateTwoFa', response.data.infoUser.isTwoFactorAuthenticationEnabled);
                    
                    if (isAuthenticated && store.getters.isTwoFaActivated) {
                        showTurnOnComponent.value = true;
                    }
                    if (isAuthenticated) {
                        shouldInitSocket.value = true;
                    }
                    if (isAuthenticated && !store.getters.isTwoFaActivated) {
                        router.push('/home');
                    }

                }
            } catch (error) {
                console.error("Erreur lors de la vérification de l'authentification:", error);
            }
        }

        function handleTwoFaStatus(status) {
            if (status) {
                router.push('/home');
                showTurnOnComponent.value = false;
            }
        }

        return {
            showTurnOnComponent,
            handleTwoFaStatus,
            shouldInitSocket,
        };
    }
};
</script>

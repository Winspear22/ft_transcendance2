<template>
    <div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { authenticate } from '../authService';

export default {
    setup() {
        const errorMessage = ref(''); 
        const router = useRouter();
        const store = useStore();

        async function handleAuthentication() {
            try {
                const parsedCookie = await authenticate();

                if (parsedCookie && parsedCookie.accessToken) {
                    setTokenToLocalStorage(parsedCookie.accessToken);
                    setAuthenticationToStore();
                    navigateToHome();
                }
            } catch (error) {
                errorMessage.value = error.message;
            }
        }

        function setTokenToLocalStorage(token) {
            localStorage.setItem('userToken', token);
        }

        function setAuthenticationToStore() {
            store.dispatch('setUserAuthentication', true);
        }

        function navigateToHome() {
            router.push({ name: 'Home' });
        }

        onMounted(handleAuthentication);

        return {
            errorMessage
        };
    }
};
</script>

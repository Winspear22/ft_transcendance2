<template>
    <div>
    </div>
</template>

<script>
import axios from 'axios';
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
    name: 'CheckAuth',
    setup() {
        const store = useStore(); 
        const router = useRouter(); 

        onMounted(authenticate);
        
        async function authenticate() {
            const response = await axios.get('http://localhost:3000/auth/check-auth', { withCredentials: true });
            if (response.data.success) {
                if (response.data.cookie) {
                    store.dispatch('setToken', response.data.cookie);
                }               
                if (response.data.infoUser.user_status === 'Online') {
                    store.dispatch('authenticate', true);
                }
                else
                    store.dispatch('authenticate', false);
                store.dispatch('activateTwoFa', response.data.infoUser.isTwoFactorAuthenticationEnabled);
                router.push('/home');
            }
        }

        return {};
    }
};
</script>
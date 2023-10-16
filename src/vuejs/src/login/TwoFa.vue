<template>
    <div v-if="showPopup">
        <input type="text" v-model="twoFaCode" placeholder="Enter 2FA Code" />
        <button @click="verifyTwoFa">Submit</button>
        <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';

export default {
    name: 'TwoFa',
    setup(_, { emit }) {
        const store = useStore();
        const twoFaCode = ref('');
        const errorMessage = ref('');
        const showPopup = ref(true);

        async function verifyTwoFa() {
            try {
                const response = await axios.post('http://made-f0cr5s6:3000/auth/verify-two-fa', { code: twoFaCode.value });
                if (response.data.success) {
                    showPopup.value = false;
                    emit('twoFaStatusChanged', true);
                    store.dispatch('authenticate', true);
                    errorMessage.value = 'Invalid 2FA Code.';
                }
            } catch (error) {
                errorMessage.value = 'An error occurred.';
            }
        }

        return {
            twoFaCode,
            errorMessage,
            verifyTwoFa,
            showPopup
        };
    }
};
</script>
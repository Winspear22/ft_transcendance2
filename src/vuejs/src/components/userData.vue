<template>
    <div></div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
    name: 'UserData',

    setup(_, { emit }) {
        const infoUser = ref(null);
        const isLoggedIn = ref(false);

        async function userData() {
            try {
                const response = await axios.get('http://localhost:3000/check-auth', { withCredentials: true });
                if (response.data.infoUser.user_status === "Online") {
                    isLoggedIn.value = true;
                    infoUser.value = response.data.infoUser;
                } else {
                    isLoggedIn.value = false;
                }
            } catch (error) {
                isLoggedIn.value = false;
            }
            emit('user-data', {
                isLoggedIn: isLoggedIn.value,
                infoUser: infoUser.value
            });
        }

        onMounted(() => {
            userData();
        });

        return {};  // Rien n'est retourné car tout est géré par des events
    }
};
</script>
<template>
    <div></div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';

export default {
    name: 'UserStatusChecker',
    props: {
        checkInterval: {
            type: Number,
            default: 5000
        }
    },
    setup(props, { emit }) {
        const isLoggedIn = ref(false);
        const userInfo = ref(null);
        let intervalId;

        async function checkUserStatus() {
            try {
                const response = await axios.get('http://localhost:3000/check-auth', { withCredentials: true });
                if (response.data.infoUser.user_status === "Online") {
                    isLoggedIn.value = true;
                    userInfo.value = response.data.infoUser;
                } else {
                    isLoggedIn.value = false;
                }
            } catch (error) {
                isLoggedIn.value = false;
            }
            
            // Emit event avec statut et info user
            emit('status-checked', {
                isLoggedIn: isLoggedIn.value,
                userInfo: userInfo.value
            });
        }

        onMounted(() => {
            checkUserStatus();
            intervalId = setInterval(checkUserStatus, props.checkInterval);
        });

        onUnmounted(() => {
            clearInterval(intervalId);
        });

        return {};  // Rien n'est retourné car tout est géré par des event
    }
};
</script>
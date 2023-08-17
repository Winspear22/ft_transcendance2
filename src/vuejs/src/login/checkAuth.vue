<template>
    <div>
        <!-- Vous pouvez ajouter un bouton ou un autre élément pour déclencher la fonction authenticate si nécessaire -->
    </div>
</template>

<script>
import { onMounted } from 'vue';
import axios from 'axios';

export default {
    name: 'CheckAuth',
    setup() {
        onMounted(authenticate);
        
        async function authenticate() {
            const response = await axios.get('http://localhost:3000/auth/check-auth', { withCredentials: true });
            
            if (response) {
                console.log(response);
            }
        }

        return {}; // Vous pouvez retourner des propriétés ou des fonctions à utiliser dans le template ici si nécessaire.
    }
};
</script>

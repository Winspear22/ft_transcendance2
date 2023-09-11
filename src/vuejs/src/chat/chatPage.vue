<template>
    <div class= "chat-container">
      <h1>C H A T</h1>
    </div>
</template>


<script>
import io from 'socket.io-client';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            socket: null
        };
    },

    computed: {
        ...mapGetters(['accessToken'])
    },

    mounted() {
        const cookie = this.accessToken;
       
        console.log("cookie in front", cookie);
        if(!cookie) {
            console.error("Token non disponible !");
            return;
        }

        this.socket = io('http://localhost:3000/dms', {
            query: {
                cookie: cookie
            }
        });
        
        this.socket.on('Connection', () => {
            console.log("Connecté au serveur backend !");
        });
    },
    
    beforeDestroy() {
        this.socket.disconnect();
    }
};
</script>
<!-- <template>
  <div>
    <button @click="handleLogin">Login</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleLogin() {
      console.log('Login button clicked');
      // Vous pouvez envoyer une requête HTTP ou utiliser une autre méthode pour communiquer avec le conteneur NestJS ici
    }
  }
}
</script>-->

<template>
  <div class="hello">
    <button @click="sendMessage">Login</button>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'HelloWorld',
  data() {
    return {
      socket: null,
    };
  },
  mounted() {
    this.socket = io('http://localhost:3000'); // Remplace par l'URL de ton serveur NestJS
  },
  methods: {
    sendMessage() {
      this.socket.emit('login', 'Button clicked!');
    },
  },
};
</script>

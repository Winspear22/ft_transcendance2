<template>
  <div id="app">
    <h1>Authentification OAuth avec NestJS</h1>
    <button @click="loginWith42">Se connecter avec 42</button>
    <button v-if="isAuthenticated" @click="logout">Se deconnecter</button>
    <div v-if="isAuthenticated">
      <p>Bravo, {{ username }}, tu t'es connecté avec succès !</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
      username: '',
    };
  },
  methods: {
    loginWith42() {
      window.location.href = 'http://localhost:3000/42/login';
    },
    logout() {
      this.isAuthenticated = false;
      this.username = '';
      axios.post('http://localhost:3000/logout')
        .then(() => {
          this.$router.push('/');
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:3000/profile', { withCredentials: true });

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        this.username = response.data.username;
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.log(error);
    }
  },
};
</script>

<style>
#app {
  text-align: center;
  margin-top: 60px;
}

button {
  margin: 20px;
  padding: 10px 20px;
  font-size: 1.2em;
}
</style>

<template>
  <div id="app">
    <h1>Authentification OAuth avec NestJS</h1>
    <button @click="authenticateWith42">Se connecter avec 42</button>
    <button @click="authenticateWithGoogle">Se connecter avec Google</button>
    <button @click="logout">Se deconnecter</button>
    <div v-if="user">
      <p>ID: {{ user.id }}</p>
      <p>Xlogin: {{ user.username }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      user: null,
    };
  },
  methods: {
    authenticateWith42() {
      window.location.href = 'http://localhost:3000/login/42';
    },
    authenticateWithGoogle() {
      window.location.href = 'http://localhost:3000/login/google';
    },
    logout() {
      window.location.href = 'http://localhost:8080';
    }
  },
  async created() {
    try {
      const response = await fetch('http://localhost:3000/profile');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        this.user = await response.json();
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

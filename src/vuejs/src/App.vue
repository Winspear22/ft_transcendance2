<template>
  <div id="app">
    <h1>Authentification OAuth avec NestJS</h1>
    <button @click="authenticateWith42">Se connecter avec 42</button>
    <button @click="authenticateWithGoogle">Se connecter avec Google</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    authenticateWith42() {
      window.location.href = 'http://localhost:3000/login/42';
    },
    authenticateWithGoogle() {
      window.location.href = 'http://localhost:3000/login/google';
    },
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


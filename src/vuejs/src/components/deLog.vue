<template>
  <div>
    Vous êtes connecté
    <button @click="logout">Se déconnecter</button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // ...code de déconnexion
      this.$emit('logout-success');
    }
  }
};
</script>

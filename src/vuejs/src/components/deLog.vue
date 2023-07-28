<template>
  <div>
    <button class="dual-color-button" @click="logout">
      <span class="logout-one">Se déco</span>
      <span class="logout-two">nnecter</span>
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    async logout() {
      try {
        const response = await axios.post('http://localhost:3000/Logout', {}, { withCredentials: true });

        console.log("reponse logout please : ", response.status);
        if (response.status === 201) {
          this.$emit('logout-success');
        }
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
    }
  }
};
</script>


<style scoped>
.dual-color-button {
  background: linear-gradient(to right, #2459d5 50%, #2fe8ee 50%);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 30px;
}

.logout-two {
  color: #2459d5;
}

.logout-one {
  color: #2fe8ee;
}
</style>
<template>
    <div class="score-board">
      <h2>STATISTIQUES</h2>
      <ul v-if="userMatchHistory">
        <li><span>Parties jouées: {{ userMatchHistory.total_parties }}</span></li>
        <li><span>Nombre de victoire: {{ userMatchHistory.total_victoire }}</span></li>
        <li><span>Nombre de défaite: {{ userMatchHistory.total_défaite }}</span></li>
        <li><span>Pourcentage de victoire: {{ userMatchHistory.winrate }}%</span></li>
      </ul>
      <h2>Historique des Matchs</h2> 
      <ul v-if="userMatchHistory">
        <li v-for="(match, index) in userMatchHistory.matches" :key="index">
          <div>
            <span>{{ match.player1 }}</span>
            <span>{{ match.player1_points }}</span>
            <span>-</span>
            <span>{{ match.player2_points }}</span>
            <span>{{ match.player2 }}</span>
          </div>
        </li>
      </ul>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
// import { useRouter } from 'vue-router';

export default {
    name: 'printMatchHistory',
    setup() {
      const store = useStore();
      // const router = useRouter();  // Ajout de cette ligne pour utiliser le router
      const gameSocket = store.getters.gameSocket;
      const userMatchHistory = ref();

      onMounted(() => {
        gameSocket.emit('matchHistory');
        gameSocket.on('matchHistory', (matchHistory) => {
          userMatchHistory.value = matchHistory;
        });
      });

      return {
        userMatchHistory
      };
    }
};
</script>

<style scoped>


</style>
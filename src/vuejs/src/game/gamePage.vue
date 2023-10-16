<template>
  <div class= "game-container">
    <div v-if="!ready" class="toPlay-btns">
      <button @click="printMaps" :disabled="isGameButtonDisabled">Jouer</button>&ensp;
      <button @click="stopSearch" :disabled="isCancelButtonDisabled">Annuler</button>
    </div>
    <div v-else>
      <canvas-component :maGame="laGame"></canvas-component>
    </div>
    <div v-if="printMap" class="mapsSelect">
      <span>Jeu Original</span>
      <img src="@/assets/maps/retro.png" @click="mapRetro" alt="une map" class="maps"/>
      <span>Cartes</span>
      <img src="@/assets/maps/beach.png" @click="mapBeach" alt="une map" class="maps"/>
      <img src="@/assets/maps/earth.png" @click="mapEarth" alt="une map" class="maps"/>
      <img src="@/assets/maps/tennis.png" @click="mapTennis" alt="une map" class="maps"/>
      <button @click="hideMaps">fermer</button>
    </div>
    <span>Touche z, w ou fléche haut pour monter, s ou fléche bas pour descendre.</span>
  </div>
</template>

<script>
import CanvasComponent from "./gameComponent/canvasComponent.vue";
import store from "@/store";

export default {
components: {
  CanvasComponent,
},
data() {
  return {
    laGame:{
      game: null,
      idx: null,
      url_map: null,
    },
    printMap: false,
    w_idx: null,
    ready: false,
    isInMatchMaking: false,
    isGameButtonDisabled: false,
    isCancelButtonDisabled: true,
  }
},
computed: {
},
async mounted() {
  await this.infosGame();
  store.getters.gameSocket.on('finish', () => {
    this.ready = false;
    this.isInMatchMaking = false;
    this.isGameButtonDisabled = false;
    this.isCancelButtonDisabled = true;
    store.getters.gameSocket.emit('gameEnd', this.laGame.idx);
  });
},
methods: {
  printMaps() {
    this.printMap = true;
    this.isGameButtonDisabled = true;
  },
  hideMaps() {
    this.printMap = false;
    this.isGameButtonDisabled = false;
  },
  mapRetro() {
    this.laGame.url_map = "retro.png";
    this.printMap = false;
    this.startSearch();
  },
  mapBeach() {
    this.laGame.url_map = "beach.png";
    this.printMap = false;
    this.startSearch();
  },
  mapEarth() {
    this.laGame.url_map = "earth.png";
    this.printMap = false;
    this.startSearch();
  },
  mapTennis() {
    this.laGame.url_map = "tennis.png";
    this.printMap = false;
    this.startSearch();
  },
  startSearch() {
    this.isGameButtonDisabled = true;
    this.isCancelButtonDisabled = false;
    // console.log(this.laGame.url_map);
    this.isInMatchMaking = true;
    store.getters.gameSocket.emit('searchGame');
  },
  stopSearch() {
    this.isGameButtonDisabled = false;
    this.isCancelButtonDisabled = true;
    this.isInMatchMaking = false;
    store.getters.gameSocket.emit('stopSearchGame', this.w_idx);
  },
  async infosGame() {
    store.getters.gameSocket.on('w_idx', (data) => {
      this.w_idx = data;
    });
    store.getters.gameSocket.on("theGame", data => {
      this.laGame.game = data.gameI;
      this.laGame.idx = data.idx;
      this.ready = true;
    });
  },
},
beforeRouteLeave(to, from, next) {
  // Effectuez votre vérification de condition ici
  if (!this.ready && !this.isInMatchMaking) {
    // Si la condition est vraie, autorisez la navigation
    next();
  } else {
    // Si la condition est fausse, empêchez la navigation
    setTimeout(() => {
    next(false);
    alert("Vous ne pouvez pas quitter cette page maintenant.");
  }, 0); 
  }
},
};

</script>

<style scoped>
.game-container {
display: flex;
flex-direction: column;
align-items: center;
}
.toPlay-btns{
margin-top: 15px;
display: flex;
flex-direction: row;
}

.mapsSelect {
  display: flex;
  flex-direction: column;
}
.maps {
width: 100px;
height: 100px;
}

</style>

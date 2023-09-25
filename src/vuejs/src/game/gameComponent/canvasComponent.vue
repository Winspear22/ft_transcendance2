<template>
    <div class="game-back">
        <span class="player-score1">{{ player1Score }}</span>
        <span class="player-score2">{{ player2Score }}</span>
        <span v-if="countdown" class="countdown">{{ countdown }}</span>
      <canvas ref="canvas"></canvas>
      <gameBackground :mapUrl="maGame.url_map"></gameBackground>
    </div>
</template>

<script>

import gameBackground from './gameBackground.vue';
import store from "@/store";

export default {
    components: {
    gameBackground,
  },
  props: {
    maGame: Object,
  },
  data() {
    return {
      grid: 15,
      player1Score: 0,
      player2Score: 0,
      countdown: 0,
    }
  },
  computed: {
    dataObject() {
      return {
      }
    },
  },
  async mounted() {
    const canvas = this.$refs.canvas;
    const ctx = canvas.getContext('2d');
    canvas.width = 850;
    canvas.height = 585;

    // this.canvasWidth = canvas.width;
    // this.canvasHeight = canvas.height;

    const self = this;
    await store.getters.gameSocket.on('countdown', data => {
      this.countdown = data;
    });
    await store.getters.gameSocket.on('Sync', data => {
      this.player1Score = data.p1.points;
      this.player2Score = data.p2.points;  
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // draw ball
        if (this.maGame.url_map == "beach.png")
          ctx.fillStyle = 'blue';
        else
          ctx.fillStyle = 'white';
        ctx.fillRect(data.ball.x, data.ball.y, data.ball.width, data.ball.height);

        // draw paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(data.p1.x, data.p1.y, data.p1.width, data.p1.height);
        ctx.fillRect(data.p2.x, data.p2.y, data.p2.width, data.p2.height);

        // draw walls
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, 0, canvas.width, this.grid);
        ctx.fillRect(0, canvas.height - this.grid, canvas.width, canvas.height);
    });
    document.addEventListener('keydown', function(e) {
      // e;
      let key = e.which;
      let idx = self.maGame.idx;
      
      // console.log("idx ", key, idx);
      if (key !== undefined && idx !== undefined)
      {
        store.getters.gameSocket.emit('press', { key, idx} );
      }
    });
    
    // listen to keyboard events to stop the paddle if key is released
    document.addEventListener('keyup', function(e) {
      // e;
      let key = e.which;
      let idx = self.maGame.idx;
      
      // console.log("idx ", key, idx);
      if (key !== undefined && idx !== undefined)
      {
        store.getters.gameSocket.emit('release', { key, idx } );
      }
    });
    // await store.getters.gameSocket.on('finish', () => {
    //   window.removeEventListener('keydown', function(e){e;});
    //   window.removeEventListener('keyup', function(e){e;});
    // });
  },
  methods: {

  },
  beforeDestroy() {
    window.removeEventListener('keydown');
    window.removeEventListener('keyup');
    
  },
};
</script>

<style>

.game-back{
    position: relative;
    border: 2px solid white;
    height: 585px;
    width: 850px;
}
.player-score1 {
  position: absolute;
  top: 5%;
  left: 25%;
  color: white;
}
.player-score2 {
  position: absolute;
  top: 5%;
  left: 75%;
  color: white;
}
.countdown {
  position: absolute;
  top: 50%;
  left: 50%;
  color: white;
  font-size: 50px;
}

</style>

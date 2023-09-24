<template>
        <img :src="backgroundGame" alt="Terrain de jeu" class="background-game"/>
</template>

<script>
export default {
    name: 'backGame',
    props: {
        mapUrl: String,
    },
    computed: {
        backgroundGame() {
            console.log()
            if (this.mapUrl === "retro.png")
                {console.log(this.mapUrl);return require('@/assets/maps/retro.png');}
            if (this.mapUrl === "beach.png")
                {console.log(this.mapUrl);return require('@/assets/maps/beach.png');}
            if (this.mapUrl === "earth.png")
                {console.log(this.mapUrl);return require('@/assets/maps/earth.png');}
            if (this.mapUrl === "tennis.png")
                {console.log(this.mapUrl);return require('@/assets/maps/tennis.png');}
            else
                {console.log(this.mapUrl);return require('@/assets/maps/retro.png');}
        }
    },
    async mounted() {
    }
}
</script>

<style scoped>
.background-game {
    position: absolute;
    top:0;
    left: 0;
    height: 585px;
    width: 850px;
    z-index: -1;
}
</style>
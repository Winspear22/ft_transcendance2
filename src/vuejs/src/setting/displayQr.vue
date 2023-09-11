<template>
    <div v-if="qrCodeUrl">
        <img :src="qrCodeUrl" alt="QR Code" />
        <turnOn v-if="qrCodeUrl && !isTwoFaActivated"></turnOn>
    </div>
</template>

<script>
import turnOn from './turnOn.vue';
import { mapGetters } from 'vuex';

export default {
    components: {
        turnOn
    },
    computed: {
        ...mapGetters(['isTwoFaActivated'])
    },
    props: {
        qrCodeUrl: {
            type: String,
            default: null
        }
    }
}
</script>%
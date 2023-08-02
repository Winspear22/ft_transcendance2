<template>
  <div>
      <displayUser v-if="userInfo" :userInfo="userInfo" />
  </div>
</template>

<script>
import displayUser from './displayUser.vue';

export default {
  components: {
    displayUser
  },

  props: ['userInfo'],
  methods: {
      logout() {
          this.$emit('logout');
      }
  }
};
</script>
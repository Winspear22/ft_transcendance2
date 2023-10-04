<template>
    <div v-if="showPopup" class="popup-validate">
      Votre profil a été modifié
    </div>
  </template>
  
  <script>
  export default {
    name: 'popupValidate',
    data() {
      return {
        showPopup: true,
      };
    },
    mounted() {
      setTimeout(() => {
        this.showPopup = false;
        this.$router.push('/setting');
      }, 1000);
    }
  };
  </script>
  
  <style scoped>
.popup-validate {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
</style>
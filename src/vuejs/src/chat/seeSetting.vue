<template>
    <div class="settings-container">
      <button @click="showMenu = !showMenu">⚙</button>
      <div v-if="showMenu" class="settings-dropdown">
        <button @click="openQuitRoom">Quitter la salle</button>
        <button @click="openChangePassword">Changer le mot de passe</button>
      </div>
      <ChangePassword v-if="showChangePasswordModal" :visible="showChangePasswordModal" :channel-name="channelName" @close="showChangePasswordModal = false" />
      <div v-for="(item, index) in items" :key="index">
        <QuitRoom :room="item" :index="index" />
      </div>

    </div>
</template>

<script>
import ChangePassword from './ChangePassword.vue';
import QuitRoom from './quitRoom.vue';

export default {
    props: ['channelName'],
    components: { ChangePassword, QuitRoom },
    data() {
      return {
        showMenu: false,
        showChangePasswordModal: false,
        showQuitRoom: false,
        roomData: {}  // Exemple de données, à ajuster selon vos besoins
      };
    },
    methods: {
      openChangePassword() {
        this.showChangePasswordModal = true;
      },
      openQuitRoom() {
        this.showQuitRoom = true;
      }
    }
}
</script>
  
<style scoped>
.settings-container {
  position: relative;
}
  
.settings-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  border: 1px solid #ccc;
  background-color: #fff;
  z-index: 1;
}
</style>

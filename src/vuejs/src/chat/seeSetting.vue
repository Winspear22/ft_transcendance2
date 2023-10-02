<template>
  <div class="settings-container">
    <button @click="showMenu = !showMenu">⚙</button>
    <div v-if="showMenu" class="settings-dropdown">
      <button @click="openQuitRoom">Quitter la salle</button>
      <button @click="openChangePassword">Changer le mot de passe</button>
      <button @click="openInviteRoom">Inviter à la salle</button>
    </div>
    <ChangePassword v-if="showChangePasswordModal" :visible="showChangePasswordModal" :channel-name="channelName" @close="showChangePasswordModal = false" />
    <QuitRoom v-if="showQuitRoomModal" :channel-name="channelName" @close="showQuitRoomModal = false" />
    <InviteRoom v-if="showInviteRoomModal" :channel-name="channelName" @close="showInviteRoomModal = false" />
  </div>
</template>

<script>
import ChangePassword from './ChangePassword.vue';
import QuitRoom from './quitRoom.vue';
import InviteRoom from './InviteRoom.vue';


export default {
  props: ['channelName'],
  components: { ChangePassword, QuitRoom, InviteRoom },
  data() {
    return {
      showMenu: false,
      showChangePasswordModal: false,
      showQuitRoomModal: false,
      showInviteRoomModal: false,  // ajouté
    };
  },
  methods: {
    openChangePassword() {
      this.showChangePasswordModal = true;
    },
    openQuitRoom() {
      this.showQuitRoomModal = true;
    },
    openInviteRoom() {   // ajouté
      this.showInviteRoomModal = true;
    },
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

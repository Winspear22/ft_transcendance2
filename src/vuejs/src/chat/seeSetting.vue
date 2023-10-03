<template>
    <div class="settings-container">
      <button @click="showMenu = !showMenu">⚙</button>
      <ul v-if="showMenu" class="settings-dropdown">
        <li><button @click="openQuitRoom">Quitter la salle</button></li>
        <li><button @click="openChangePassword">Changer le mot de passe</button></li>
        <li><button @click="openInviteRoom">Inviter à la salle</button></li>
        <li><button @click="openBanUser">Bannir un utilisateur</button></li>
      </ul>
      <ChangePassword v-if="showChangePasswordModal" :visible="showChangePasswordModal" :channel-name="channelName" @close="showChangePasswordModal = false" />
      <QuitRoom v-if="showQuitRoomModal" :channel-name="channelName" @close="showQuitRoomModal = false" />
      <InviteRoom v-if="showInviteRoomModal" :channel-name="channelName" @close="showInviteRoomModal = false" />
      <BanUserModal v-if="showBanUserModal" :channel-name="channelName" @close="showBanUserModal = false" />
    </div>
  </template>
  
  
  <script>
  import ChangePassword from './changePassword.vue';
  import QuitRoom from './quitRoom.vue';
  import InviteRoom from './inviteRoom.vue';
  import BanUserModal from './banUser.vue';
  
  
  export default {
    props: ['channelName'],
    components: { ChangePassword, QuitRoom, InviteRoom, BanUserModal },
    data() {
      return {
        showMenu: false,
        showChangePasswordModal: false,
        showQuitRoomModal: false,
        showInviteRoomModal: false,
        showBanUserModal: false,
      };
    },
    methods: {
      openChangePassword() {
        this.showChangePasswordModal = true;
      },
      openQuitRoom() {
        this.showQuitRoomModal = true;
      },
      openInviteRoom() {
        this.showInviteRoomModal = true;
      },
      openBanUser() {
        this.showBanUserModal = true;
      },
    }
  }
  </script>
  
  <style scoped>
  .settings-container {
    position: relative;
  }
  
  .settings-dropdown {
    padding: 0;         /* pour enlever le padding par défaut */
    margin: 0;          /* pour enlever la marge par défaut */
    position: absolute;
    top: 100%;
    right: 0;
    border: 1px solid #ccc;
    background-color: transparent;
    z-index: 1;
  }
  
  .settings-dropdown li {
    padding: 5px 10px;  /* un petit padding pour chaque élément de la liste */
  }
  
  </style>
<template>
    <div class="settings-container">
      <button @click="showMenu = !showMenu">⚙</button>
      <ul v-if="showMenu" class="settings-dropdown">
        <li><button @click="openQuitRoom">Quitter la salle</button></li>
        <li><button @click="openChangePassword">Changer le mot de passe</button></li>
        <li><button @click="openInviteRoom">Inviter à la salle</button></li>
        <li><button @click="openBanUser">Bannir un utilisateur</button></li>
        <li><button @click="openUnbanUser">Debannir un utilisateur</button></li>
        <li><button @click="openKickUser">Kick un utilisateur</button></li>
        <li><button @click="openMuteUser">Mute un utilisateur</button></li>
        <li><button @click="openUnmuteUser">Demute un utilisateur</button></li>
        <li><button @click="openSeeUser">Voir les utilisateurs</button></li>
      </ul>
      <ChangePassword v-if="showChangePasswordModal" :visible="showChangePasswordModal" :channel-name="channelName" @close="showChangePasswordModal = false" />
      <QuitRoom v-if="showQuitRoomModal" :channel-name="channelName" @close="showQuitRoomModal = false" />
      <InviteRoom v-if="showInviteRoomModal" :channel-name="channelName" @close="showInviteRoomModal = false" />
      <BanUserModal v-if="showBanUserModal" :channel-name="channelName" @close="showBanUserModal = false" />
      <UnbanUserModal v-if="showUnbanUserModal" :channel-name="channelName" @close="showUnbanUserModal = false" />
      <KickUserModal v-if="showKickUserModal" :channel-name="channelName" @close="showKickUserModal = false" />
      <MuteUserModal v-if="showMuteUserModal" :channel-name="channelName" @close="showMuteUserModal = false" />
      <UnmuteUserModal v-if="showUnmuteUserModal" :channel-name="channelName" @close="showUnmuteUserModal = false" />
      <SeeUserModal v-if="showSeeUserModal" :usersDTO="userDTOs" @close="showSeeUserModal = false" />
    </div>
  </template>
  
  
  <script>
  import ChangePassword from './changePassword.vue';
  import QuitRoom from './quitRoom.vue';
  import InviteRoom from './inviteRoom.vue';
  import BanUserModal from './banUser.vue';
  import UnbanUserModal from './unbanUser.vue';
  import KickUserModal from './kickUser.vue';
  import MuteUserModal from './muteUser.vue';
  import UnmuteUserModal from './unmuteUser.vue';
  import SeeUserModal from './seeUser.vue';
  
  
  export default {
    props: ['channelName', 'userDTOs'],
    components: { ChangePassword, QuitRoom, InviteRoom, BanUserModal, UnbanUserModal, KickUserModal, MuteUserModal, UnmuteUserModal, SeeUserModal },
    data() {
      return {
        showMenu: false,
        showChangePasswordModal: false,
        showQuitRoomModal: false,
        showInviteRoomModal: false,
        showBanUserModal: false,
        showUnbanUserModal: false,
        showKickUserModal: false,
        showMuteUserModal: false,
        showUnmuteUserModal: false,
        showSeeUserModal: false,
      };
    },
    watch: {
      channelName(newVal, oldVal) {
        if (newVal !== oldVal) {
            this.showMenu = false;  // Fermez le menu si le channelName change
        }
      }
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
      openUnbanUser() {
        this.showUnbanUserModal = true;
      },
      openKickUser() {
        this.showKickUserModal = true;
      },
      openMuteUser() {
        this.showMuteUserModal = true;
      },
      openUnmuteUser() {
        this.showUnmuteUserModal = true;
      },
      openSeeUser() {
        this.showSeeUserModal = true;
      },
    }
  }
  </script>
  
  <style scoped>
  .settings-container {
    position: relative;
  }
  
 
  .settings-container > button {
    background-color: transparent;  
    border: none;                   
    color: #2fe8ee;               
    cursor: pointer;           
}

.settings-container > button:hover {
    color: black;                  
}
  
.settings-dropdown {
    padding: 0;         
    margin: 0;          
    position: absolute;
    top: 100%;
    right: 0;
    border: 1px solid #ccc;
    background: linear-gradient(to left, #2fe8ee, #2459d5); /* Gradient de bleu */
    z-index: 1;
}

.settings-dropdown li {
    padding: 5px 10px; 
    list-style-type: none; /* Enlève les puces */
}

.settings-dropdown li button {
    background-color: transparent; /* Fond transparent pour les boutons */
    border: none;                   /* Pas de bordure pour les boutons */
    color: #2fe8ee;                /* Couleur initiale des boutons */
    cursor: pointer;               /* Indiquer que les boutons sont cliquables */
    font-size: inherit;            /* Hérite de la taille de la police du parent */
    text-align: left;              /* Aligner le texte à gauche */
    width: 100%;                   /* Utiliser toute la largeur disponible */
}

.settings-dropdown li button:hover {
    color: black;                  /* Couleur de survol pour les boutons */
}

.settings-container > button {
    background-color: transparent;  
    border: none;                    
    color: #2fe8ee;               
    cursor: pointer;             
    font-size: 24px;               
}

  </style>
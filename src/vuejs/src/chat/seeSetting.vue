<template>
    <div class="settings-container">
      <button @click="showMenu = !showMenu">⚙</button>
      <ul v-if="showMenu" class="settings-dropdown">
        <li><button @click="openQuitRoom">Quitter la salle</button></li>
        <li v-if="isAdmin"><button @click="openChangePassword">Changer le mot de passe</button></li>
        <li v-if="isAdmin && room.isPrivate === true"><button @click="openInviteRoom">Inviter à la salle</button></li>
        <li v-if="isAdmin"><button @click="openBanUser">Bannir un utilisateur</button></li>
        <li v-if="isAdmin"><button @click="openUnbanUser">Debannir un utilisateur</button></li>
        <li v-if="isAdmin"><button @click="openKickUser">Kick un utilisateur</button></li>
        <li v-if="isAdmin"><button @click="openMuteUser">Mute un utilisateur</button></li>
        <li v-if="isAdmin"><button @click="openUnmuteUser">Demute un utilisateur</button></li>
        <li v-if="isAdmin"><button @click="openPromoteUser">Promouvoir un utilisateur</button></li>
        <li v-if="isAdmin"><button @click="openDemoteUser">Retirer les droits admin</button></li>
        <li><button @click="openSeeUser">Voir les utilisateurs</button></li>

      </ul>
      <infoUser @userInfoFetched="handleUserInfo"></infoUser>

      <ChangePassword v-if="showChangePasswordModal" :visible="showChangePasswordModal" :channelName="room.roomName" @close="showChangePasswordModal = false" />
      <QuitRoom v-if="showQuitRoomModal" :channelName="room.roomName" @close="showQuitRoomModal = false" />
      <InviteRoom v-if="showInviteRoomModal" :channelName="room.roomName" @close="showInviteRoomModal = false" />
      <BanUserModal v-if="showBanUserModal" :channelName="room.roomName" @close="showBanUserModal = false" />
      <UnbanUserModal v-if="showUnbanUserModal" :channelName="room.roomName" @close="showUnbanUserModal = false" />
      <KickUserModal v-if="showKickUserModal" :channelName="room.roomName" @close="showKickUserModal = false" />
      <MuteUserModal v-if="showMuteUserModal" :roomName="room.roomName" @close="showMuteUserModal = false" />
      <UnmuteUserModal v-if="showUnmuteUserModal" :channelName="room.roomName" @close="showUnmuteUserModal = false" />
      <PromoteUserModal v-if="showPromoteUserModal" :channelName="room.roomName" @close="showPromoteUserModal = false" />
      <DemoteUserModal v-if="showDemoteUserModal" :channelName="room.roomName" @close="showDemoteUserModal = false" />
      <SeeUserModal v-if="showSeeUserModal" :channelName="room.roomName" @close="showSeeUserModal = false" />
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
  import infoUser from '../setting/infoUser.vue';
  import PromoteUserModal from './promoteAdmin.vue';
  import DemoteUserModal from './demoteAdmin.vue';
  
  
  export default {
    props: {
      room: {
        type: Object,
        required: true
      }
    },

    components: { ChangePassword, QuitRoom, InviteRoom, BanUserModal, UnbanUserModal, KickUserModal, MuteUserModal, UnmuteUserModal, SeeUserModal, infoUser, PromoteUserModal, DemoteUserModal },
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
        showPromoteUserModal: false,
        showDemoteUserModal: false,
        userId: null,
      };
    },
    computed: {
      isAdmin() {
        return this.room.admins.includes(this.userId);
      },
    },
    watch: {
      channelName(newVal, oldVal) {
        if (newVal !== oldVal) {
            this.showMenu = false; 
        }
      }
    }, 
    methods: {
      handleUserInfo(userInfo) {
        this.userId = userInfo.id;
      },
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
      openPromoteUser() {
        this.showPromoteUserModal = true;
      },
      openDemoteUser() {
        this.showDemoteUserModal = true;
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
    background-color: transparent;
    border: none;           
    color: #2fe8ee;           
    cursor: pointer;           
    font-size: inherit;          
    text-align: left;     
    width: 100%;              
}

.settings-dropdown li button:hover {
    color: black;               
}

.settings-container > button {
    background-color: transparent;  
    border: none;                    
    color: #2fe8ee;               
    cursor: pointer;             
    font-size: 24px;               
}

  </style>
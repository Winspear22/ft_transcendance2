<template>
    <div class="promote-admin">
      <div class="admin-content">
        <h3>Promouvoir un utilisateur en admin</h3>
        <p :class="['admin-message', { error: isError }]" v-if="adminMessage">{{ adminMessage }}</p>
        <label>
          Nom d'utilisateur :
          <input v-model="targetUsername" type="text" />
        </label>
        <button @click="promoteUserToAdmin">Promouvoir</button>
        <button @click="closeModal">Fermer</button>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex';
  
  export default {
    props: ['channelName'],
  
    data() {
      return {
        targetUsername: '',
        adminMessage: '',
        usersData: [],
        isError: false,
        isVisible: true,
      };
    },
  
    computed: {
      ...mapGetters(['socketChat'])
    },
  
    mounted() {
      this.socketChat.on('usersDataInRoom', this.handleUsersData);
      this.socketChat.on('promoteAdmin', this.handlePromoteResponse);
      this.fetchUsersInRoom();
    },

    beforeDestroy() {
      this.socketChat.off('promoteAdmin', this.handlePromoteResponse);
      this.socketChat.off('usersDataInRoom', this.handleUsersData);
    },
  
    methods: {
      fetchUsersInRoom() {
        this.socketChat.emit('emitUsersInRoom', {
          channelName: this.channelName
        });
      },
      closeModal() {
        this.$emit('close');
      },
  
      handleUsersData(data) {
        this.usersData = data;
      },
  
      promoteUserToAdmin() {
        const user = this.usersData.find(user => user.username === this.targetUsername);
    
        if (!user) {
            this.adminMessage = 'Utilisateur non trouvé dans la salle.';
            this.isError = true; 
            setTimeout(this.closeModal, 1000);
            return;
        }
    
        this.isError = false; 
        this.socketChat.emit('promoteAdmin', {
            channelName: this.channelName,
            TargetUserId: user.id,
        });
      },
  
      handlePromoteResponse(data) {
          if (typeof data === "string" && data.includes("Error")) {
              this.adminMessage = "Impossible de promouvoir cette personne en admin.";
              this.isError = true;
          } else if (data.includes("Succes")) {
              this.adminMessage = "Promotion réussie.";
              this.isError = false;
          } else {
              this.adminMessage = "Erreur inattendue";
              this.isError = true;
          }
          setTimeout(this.closeModal, 1000);
      },
    },
}
</script>
  
  <style scoped>
  .promote-admin {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.7);
  }
  
.admin-content {
    width: 300px;
    padding: 20px;
    background: linear-gradient(to left, #2fe8ee, #2459d5); 
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
  
button {
    margin-top: 10px;
    padding: 5px 15px;
    background-color: transparent;
    border: 1px solid #2fe8ee;
    color: #2fe8ee;
    border-radius: 5px;
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;
}

button:hover {
background-color: #2fe8ee;
color: black;
}
  
  .admin-message {
    margin-top: 10px;
color: #2fe8ee;
font-weight: bold;
  }
  
  input {
margin-top: 10px;
padding: 5px 10px;
background-color: transparent;
border: 1px solid #2fe8ee;
border-radius: 5px;
color: #2fe8ee;
transition: background-color 0.2s, color 0.2s;
}

input:hover, input:focus {
background-color: #2fe8ee;
color: black;
}
.admin-message.error {
    color: #2459d5; /* rouge pour une erreur */
}

  </style>
  
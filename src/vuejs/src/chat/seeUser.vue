<template>
    <div class="users-in-room-modal modal">
      <!-- User Info Component -->
      <info-user @userInfoFetched="handleUserInfo"></info-user>
      
      <!-- Header Section -->
      <h3>Utilisateurs dans la salle</h3>
  
      <!-- Display Users Section -->
      <ul v-if="usersData.length">
        <li v-for="user in usersData" :key="user.id">
            <template v-if="isCurrentUser(user)">
                <router-link to="/setting">{{ user.username }}</router-link>
            </template>
            <template v-else-if="isFriend(user)">
                <router-link :to="`/friend-profile/${user.username}`">{{ user.username }}</router-link>
            </template>
            <template v-else>
                <router-link :to="`/online-profile/${user.username}`">{{ user.username }}</router-link>
            </template>
        </li>
      </ul>
      <p v-else>Pas d'utilisateurs dans la salle pour le moment.</p>
  
      <!-- Action Buttons Section -->
      <button @click="closeModal">Fermer</button>
    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import infoUser from '../setting/infoUser';


export default {
    props: ['channelName'],
    components: {
        infoUser,
    },
    data() {
        return {
            usersData: [],
            friendsList: [],
            currentUserInfo: null,
        };
    },

    computed: {
      ...mapGetters(['socketChat', 'socketDm'])
    },

    mounted() {
        // Listeners for users in room
        this.socketChat.on('usersDataInRoom', this.handleUsersData);
        this.fetchUsersInRoom();
        
        // Listeners for friends list
        this.socketDm.on('emitFriends', this.handleFriendsList);
        this.socketDm.emit('emitFriends');
    },

    beforeDestroy() {
        this.socketChat.off('usersDataInRoom', this.handleUsersData);
        this.socketDm.off('emitFriends', this.handleFriendsList);
    },

    methods: {
        fetchUsersInRoom() {
            this.socketChat.emit('emitUsersInRoom', {
                channelName: this.channelName
            });
        },

        handleUsersData(data) {
            console.log("Data received:", data);
            this.usersData = data;
        },

        handleFriendsList(friends) {
            this.friendsList = friends;
        },

        isFriend(user) {
            return this.friendsList.some(friend => friend.id === user.id);
        },

        closeModal() {
            this.$emit('close');
        },
        handleUserInfo(userInfo) {
            this.currentUserInfo = userInfo;
        },

        isCurrentUser(user) {
            return this.currentUserInfo && user.username === this.currentUserInfo.username;
        },
    }
}
</script>
  
<style scoped>
.modal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: linear-gradient(to left, #2fe8ee, #2459d5);
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 300px;
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
.router-link-exact-active, router-link-active, router-link {
    color: #2fe8ee;
    cursor: pointer;
    transition: color 0.2s;
}
.modal a {
    color: #2fe8ee;
    cursor: pointer;
    transition: color 0.2s; 
}

.modal a:hover {
    color: black;
}

</style>
<template>
    <button class="remove-button" @click="removeFriend(username)">Supprimer</button>
</template>
  
<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  props: {
    username: {
      type: String,
      required: true
    }
  },

  setup() {
    const store = useStore();
    const DmSocket = store.getters.socketDm;
    const router = useRouter();

    const removeFriend = (username) => {
      if (confirm(`Voulez-vous vraiment supprimer ${username} de votre liste d'amis ?`)) {
        DmSocket.emit('removeFriend', { receiverUsername: username });

        DmSocket.on('removeFriend', (message) => {
          alert(message);
          if (!message.includes('Error')) {
            router.push('/home');
          }
        });
      }
    };

    return {
      removeFriend
    };
  }
};
</script>

<style scoped>
.remove-button {
    background-color: transparent; 
    border: none; 
    color: #2fe8ee; 
    cursor: pointer; 
    transition: color 0.3s ease; 
    font-size: 16px;  
}

.remove-button:hover {
    color: black;
}
</style>

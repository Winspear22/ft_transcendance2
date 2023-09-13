<template>
    <div>
      <h2>Supprimer un ami</h2>
      <ul v-if="friends && friends.length">
        <li v-for="friend in friends" :key="friend.id">
          <img :src="friend.profile_picture" alt="Profile Picture" />
          <span>{{ friend.username }}</span>
          <button @click="removeFriend(friend.username)">Supprimer</button>
        </li>
      </ul>
      <div v-if="!friends.length">Pas d'amis à afficher.</div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
    name: 'FriendRemoval',
    setup() {
      const friends = ref([]);
      const store = useStore();
      const socket = store.getters.socket;
      const router = useRouter();  // Ajout de cette ligne pour utiliser le router

      onMounted(() => {
        socket.emit('emitFriends');  // Demande de la liste d'amis

        socket.on('emitFriends', (friendDetails) => {
          friends.value = friendDetails;  // Mettre à jour la liste des amis avec les données reçues
        });
      });

      const removeFriend = (username) => {
        if (confirm(`Voulez-vous vraiment supprimer ${username} de votre liste d'amis ?`)) {
          socket.emit('removeFriend', { receiverUsername: username });

          socket.on('removeFriend', (message) => {
            alert(message);
            if (!message.includes('Error')) {
                router.push('/home');  // Redirection vers la page d'accueil après une suppression réussie
            }
          });
        }
      };

      return {
        friends,
        removeFriend
      };
    }
};
</script>
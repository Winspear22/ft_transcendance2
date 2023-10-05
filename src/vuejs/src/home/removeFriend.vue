<template>
  <div>
      <button class="remove-button" @click="showConfirmModal = true">Supprimer</button>

      <!-- Modal de confirmation -->
      <div v-if="showConfirmModal" class="modal">
          <div class="modal-content">
              <h3>Confirmation</h3>
              <p>Voulez-vous vraiment supprimer {{ username }} de votre liste d'amis ?</p>
              <button @click="confirmRemove">Confirmer</button>
              <button @click="closeConfirmModal">Annuler</button>
          </div>
      </div>

      <!-- Modal de validation -->
      <div v-if="showMessageModal" class="modal">
          <div class="modal-content">
              <h3>Message</h3>
              <p>{{ responseMessage }}</p>
              <button @click="closeMessageModal">Fermer</button>
          </div>
      </div>
  </div>
</template>
  
<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onBeforeUnmount, toRefs } from 'vue';


export default {
  props: {
    username: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const showConfirmModal = ref(false);
    const store = useStore();
    const DmSocket = store.getters.socketDm;
    const router = useRouter();
    const { username } = toRefs(props);
    const showMessageModal = ref(false); // Nouveau modal pour afficher les messages
    const responseMessage = ref(''); // Stocker le message de réponse



    const closeModal = () => {
      showConfirmModal.value = false;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
    };

    const confirmRemove = () => {
      showConfirmModal.value = false;
      removeFriend(username.value);
    };

    const handleRemoveFriendResponse = (message) => {
      responseMessage.value = message;
      showMessageModal.value = true;
      if (!message.includes('Error')) {
        router.push('/home');
      }
    };

    const closeMessageModal = () => {
      showMessageModal.value = false;
    };

    const removeFriend = (username) => {
        DmSocket.emit('removeFriend', { receiverUsername: username });
        DmSocket.on('removeFriend', handleRemoveFriendResponse);
    };

    onBeforeUnmount(() => {
      DmSocket.off('removeFriend', handleRemoveFriendResponse);
    });

    return {
        removeFriend,
        showConfirmModal,
        closeModal,
        confirmRemove,
        showMessageModal,
        responseMessage,
        closeMessageModal,
        closeConfirmModal,
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

.modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.modal-content {
    background-color: #2459d5;
    padding: 20px;
    border-radius: 8px;
    width: 50%;
    max-width: 400px;
    z-index: 1000;
    position: relative;
    color: #2fe8ee;
}

button {
    cursor: pointer;
    background-color: transparent;
    color: #2fe8ee;
    border: none;
    margin-right: 10px;
    transition: color 0.3s;
}

button:hover {
    color: black;
}

</style>

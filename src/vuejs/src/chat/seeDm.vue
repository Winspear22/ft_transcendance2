<template>
    <div>
      <!-- Onglets -->
      <info-user @userInfoFetched="handleUserInfo"></info-user>
      <div class="tabs">
        <div v-for="(chat, index) in chats" 
             :key="chat.id" 
             @click="activeTabIndex = index" 
             :class="{ active: activeTabIndex === index }">
          {{ getChatName(chat) }}
        </div>
      </div>
  
      <!-- Contenu de l'onglet actif -->
      <see-conv v-if="chats[activeTabIndex]" 
                :chat="chats[activeTabIndex]" 
                :user-info="userInfo"></see-conv>
      <!-- Send DM Form -->
      <send-dm v-if="chats[activeTabIndex]" 
           :chat="chats[activeTabIndex]" 
           :user-info="userInfo"></send-dm>
    </div>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import SeeConv from './seeConv.vue';
import SendDm from './sendDm.vue';
import infoUser from '../setting/infoUser';

export default {
  components: {
    SeeConv,
    SendDm,
    infoUser
  },
  setup() {
    const store = useStore();
    const socket = store.getters.socket;
    const userInfo = ref(null);
    const chats = ref([]);

    onMounted(() => {
      socket.on('emitDM', (data) => {
        chats.value = data;
      });

      socket.on('newMessage', (message) => {
        const chat = chats.value.find(c => c.id === message.chatId);
        if (chat) {
          chat.messages.push(message);
        }
      });

      socket.emit('emitDM');
    });

    function handleUserInfo(user) {
      userInfo.value = user;
    }

    const activeTabIndex = ref(0); // Pour garder une trace de l'onglet actif

    function getChatName(chat) {
      if (chat.users.length > 0) {
        if (userInfo.value && chat.users[0].username !== userInfo.value.username) {
          return chat.users[0].username;
        } else if (chat.users.length > 1) {
          return chat.users[1].username;
        }
      }
      return "Unknown";
    }

    return {
      chats,
      userInfo,
      handleUserInfo,
      activeTabIndex,
      getChatName
    }
  },
};
</script>

<style>
.tabs > div {
  cursor: pointer;
  padding: 10px;
  display: inline-block;
  margin-right: 10px;
}

.tabs > div.active {
  font-weight: bold;
  border-bottom: 2px solid blue;
}
</style>

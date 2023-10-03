<template>
    <div class="dm-container">
      <!-- User Information Component -->
      <info-user @userInfoFetched="handleUserInfo"></info-user>
  
      <!-- List of Chats -->
      <div class="chats-list">
        <div v-for="(chat, index) in chats" :key="chat.id" @click="switchTab(index)" :class="{ active: activeTabIndex === index }">
          <span class="chat-name">{{ getChatName(chat) }}</span>
          <block-dm-button :chat="chat" :user-info="userInfo" @block="blockDM"></block-dm-button>
        </div>
      </div>
  
      <!-- Vertical Separator -->
      <div class="vertical-separator"></div>
  
      <!-- Selected Chat Components -->
      <div class="selected-chat">
        <see-conv v-if="chats[activeTabIndex]" :chat="chats[activeTabIndex]" :user-info="userInfo"></see-conv>
        <send-dm v-if="chats[activeTabIndex]" :chat="chats[activeTabIndex]" :user-info="userInfo"></send-dm>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import SeeConv from './seeConv.vue';
  import SendDm from './sendDm.vue';
  import InfoUser from '../setting/infoUser';
  import BlockDmButton from './blockDm';
  import { getChatUserName } from './dmName';
  
  export default {
    name: 'DMContainer',
  
    components: {
      SeeConv,
      SendDm,
      InfoUser,
      BlockDmButton
    },
  
    setup() {
      // Vuex store and router
      const store = useStore();
      const router = useRouter();
      
      // Reactive references
      const socketDm = store.getters.socketDm;
      const userInfo = ref(null);
      const chats = ref([]);
      const activeTabIndex = ref(0);
  
      // Handle the addition of a new message to the chat
      const appendNewMessage = (message) => {
        const chat = chats.value.find(c => c.room === message.chat.room);
        if (!chat) {
          chats.value.push(message);
        } else if (!chat.messages.some(m => m.id === message.id)) {
          chat.messages.push(message);
        }
      };
  
      // Handle blocking a DM
      const blockDM = (chat) => {
        const usernameToBlock = getChatUserName(chat, userInfo.value);
        if (usernameToBlock !== "Unknown") {
          socketDm.emit('blockDM', { receiverUsername: usernameToBlock });
          router.push({ name: 'Login' });
        }
      };
  
      // Socket listeners
      onMounted(() => {
        socketDm.on('emitDM', data => chats.value = data);
        socketDm.on('sendDM', appendNewMessage);
        socketDm.emit('emitDM');
      });
  
      onBeforeUnmount(() => {
        socketDm.off('emitDM', data => chats.value = data);
        socketDm.off('sendDM', appendNewMessage);
      });
  
      return {
        chats,
        userInfo,
        handleUserInfo: user => userInfo.value = user,
        activeTabIndex,
        switchTab: index => activeTabIndex.value = index,
        getChatName: chat => getChatUserName(chat, userInfo.value),
        blockDM
      }
    }
  };
  </script>
  
  <style scoped>
  .dm-container {
    display: flex;
  }
  
  .chats-list {
    width: 250px;
    overflow-y: auto;
    border-right: 1px solid #2fe8ee;
  }
  
  .vertical-separator {
    width: 1px;
    background-color: #2fe8ee;
    height: 100%;
  }
  
  .selected-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .chat-name {
    color: #2fe8ee;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .chat-name:hover {
    color: black;
  }
  </style>
  
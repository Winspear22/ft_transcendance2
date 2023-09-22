<template>
  <div>
    <info-user @userInfoFetched="handleUserInfo"></info-user>
    
    <div class="tabs">
      <div v-for="(chat, index) in chats" 
           :key="chat.id" 
           @click="switchTab(index)" 
           :class="{ active: activeTabIndex === index }">
        {{ getChatName(chat) }}
        <button @click.stop="blockDM(chat)">Block DM</button>
      </div>
    </div>

    <see-conv v-if="chats[activeTabIndex]" 
              :chat="chats[activeTabIndex]" 
              :user-info="userInfo"></see-conv>

    <send-dm v-if="chats[activeTabIndex]" 
             :chat="chats[activeTabIndex]" 
             :user-info="userInfo"></send-dm>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import SeeConv from './seeConv.vue';
import SendDm from './sendDm.vue';
import InfoUser from '../setting/infoUser';
import { useRouter } from 'vue-router';

export default {
  components: {
    SeeConv,
    SendDm,
    InfoUser
  },
  setup() {
    const store = useStore();
    const socketDm = store.getters.socketDm;
    const userInfo = ref(null);
    const chats = ref([]);
    const activeTabIndex = ref(0);
    const router = useRouter();

    const appendNewMessage = (message) => {
      const chat = chats.value.find(c => c.room === message.chat.room);
      if (chat) {
        if (!chat.messages) {
          chat.messages = [];
        }
        chat.messages.push(message);
      } else {
        chats.value.push(message);
      }
    };

    const blockDM = (chat) => {
      const usernameToBlock = getChatName(chat);
      if (usernameToBlock !== "Unknown") {
        socketDm.emit('blockDM', { receiverUsername: usernameToBlock });
        router.push({ name: 'Login' });
      }
    };

    const updateChats = (data) => {
      chats.value = data;
    }

    const initializesocketDmListeners = () => {
      socketDm.on('emitDM', (data) => {
        updateChats(data);
      });
      socketDm.on('sendDM', (message) => {
        appendNewMessage(message);
      });
    }

    const cleanupsocketDmListeners = () => {
      socketDm.off('emitDM', updateChats);
      socketDm.off('sendDM', appendNewMessage);
    }

    onMounted(() => {
      initializesocketDmListeners();
      socketDm.emit('emitDM');
    });

    onBeforeUnmount(() => {
      cleanupsocketDmListeners();
    });

    const handleUserInfo = (user) => {
      userInfo.value = user;
    }

    const switchTab = (index) => {
      activeTabIndex.value = index;
    }

    const getChatName = (chat) => {
      if (chat && chat.users && !chat.users.length) return "Unknown";
      const otherUser = chat.users.find(u => !userInfo.value || u.username !== userInfo.value.username);
      return otherUser ? otherUser.username : "Unknown";
    }

    return {
      chats,
      userInfo,
      handleUserInfo,
      activeTabIndex,
      switchTab,
      getChatName,
      blockDM
    }
  }
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

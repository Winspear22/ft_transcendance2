<template>
  <div class="dm-container">
    <info-user @userInfoFetched="handleUserInfo"></info-user>

    <!-- List of chats -->
    <div class="chats-list">
      <div v-for="(chat, index) in chats" 
           :key="chat.id" 
           @click="switchTab(index)" 
           :class="{ active: activeTabIndex === index }">
        {{ getChatName(chat) }}
        <button @click.stop="blockDM(chat)">Block DM</button>
      </div>
    </div>

    <!-- Vertical separator -->
    <div class="vertical-separator"></div>

    <!-- Selected chat -->
    <div class="selected-chat">
      <see-conv v-if="chats[activeTabIndex]" 
                :chat="chats[activeTabIndex]" 
                :user-info="userInfo"></see-conv>

      <send-dm v-if="chats[activeTabIndex]" 
               :chat="chats[activeTabIndex]" 
               :user-info="userInfo"></send-dm>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import SeeConv from './seeConv.vue';
import SendDm from './sendDm.vue';
import InfoUser from '../setting/infoUser';
import { useRouter } from 'vue-router';
import { getChatUserName } from './dmName';

export default {
  components: { SeeConv, SendDm, InfoUser },
  setup() {
    const store = useStore();
    const socketDm = store.getters.socketDm;
    const userInfo = ref(null);
    const chats = ref([]);
    const activeTabIndex = ref(0);
    const router = useRouter();

    const appendNewMessage = (message) => {
      const chat = chats.value.find(c => c.room === message.chat.room);
      if (!chat) {
        chats.value.push(message);
        return;
      }

      if (!chat.messages.some(m => m.id === message.id)) {
        chat.messages.push(message);
      }
    };

    const blockDM = (chat) => {
      const usernameToBlock = getChatUserName(chat, userInfo.value);
      if (usernameToBlock !== "Unknown") {
        socketDm.emit('blockDM', { receiverUsername: usernameToBlock });
        router.push({ name: 'Login' });
      }
    };

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

<style scooped>
.dm-container {
  display: flex;
}

.chats-list {
  width: 250px;
  overflow-y: auto;
  border-right: 1px solid #ddd;
}

.vertical-separator {
  width: 1px;
  background-color: #ddd;
  height: 100%;
}

.selected-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

</style>
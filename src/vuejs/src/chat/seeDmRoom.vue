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

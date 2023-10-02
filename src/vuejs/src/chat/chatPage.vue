<template>
  <div class="chatContainer">
    <!-- Links to Chat and DM sub-pages -->
    <nav>
      <router-link to="/chat" class="chat-link">Chat</router-link>
      <span class="separator">|</span>
      <router-link to="/chat/dm" class="dm-link">DM</router-link>
    </nav>

    <!-- Render the child route component -->
    <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>

    <AddFriend />
    <FriendRequests />
    <ReceivingFriend />
    <invitToPlay />
    <receivingInvitToPlay />
  </div>
</template>

<script>
import AddFriend from './addFriend';
import FriendRequests from './friendRequests';
import ReceivingFriend from './receivingFriend';
import invitToPlay from './invitToPlay.vue';
import receivingInvitToPlay from './receivingInvitToPlay.vue';

export default {
  name: 'ChatContainer',
  components: {
    AddFriend,
    FriendRequests,
    ReceivingFriend,
    invitToPlay,
    receivingInvitToPlay
  }
};
</script>

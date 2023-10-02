<template>
    <div class="invitation-container" v-if="isInvited">
      <p>{{ invitationMessage }}</p>
      <button @click="acceptInvitation">Accepter</button>
      <button @click="declineInvitation">Refuser</button>
    </div>
</template>
  
<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      isInvited: false,
      invitationMessage: '',
      channelName: '',
      inviterUsername: ''
    };
  },
  computed: {
    ...mapGetters(['socketChat'])
  },
  created() {
    this.socketChat.on('inviteRoom', message => {
      console.log(message);
      if (message.startsWith("You have been invited by")) {
        const matchedChannel = message.match(/join the private room (.+)$/);
        const matchedUsername = message.match(/You have been invited by (.+) to join/);
        
        if (matchedChannel && matchedChannel[1]) {
          this.channelName = matchedChannel[1];
        }

        if (matchedUsername && matchedUsername[1]) {
          this.inviterUsername = matchedUsername[1];
        }

        this.invitationMessage = message;
        this.isInvited = true;
      }
    });
  },
  methods: {
    async acceptInvitation() {
      try {
        this.socketChat.emit('acceptRoomInvitation', {
          channelName: this.channelName,
          inviterUsername: this.inviterUsername
        });
        this.isInvited = false;
      } catch (error) {
        console.error("Erreur lors de l'acceptation de l'invitation:", error);
      }
    },
    async declineInvitation() {
      try {
        this.socketChat.emit('declineRoomInvitation', {
          channelName: this.channelName,
          inviterUsername: this.inviterUsername
        });
        this.isInvited = false;
      } catch (error) {
        console.error("Erreur lors du refus de l'invitation:", error);
      }
    }
  }
};
</script>
  

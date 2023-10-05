<template>
    <div>
      <div v-if="room.requiresPassword">
        <input v-model="password" type="password" placeholder="Enter room password">
      </div>
      <button @click="acceptInvitation">Accepter</button>
      <button @click="declineInvitation">Refuser</button>
    </div>
  </template>
  
  <script>
  import { useStore } from 'vuex';
  import { ref } from 'vue';
  
  export default {
    name: 'ResponseRoom',
    props: {
      room: {
        type: Object,
        required: true
      }
    },
    setup(props) {
      const store = useStore();
      const socketChat = store.getters.socketChat;
      const password = ref('');
  
      const acceptInvitation = () => {
        const data = {
          channelName: props.room.roomName,
          inviterUsername: props.room.inviterUsername
        };
  
        if (props.room.password) {
          data.password = password.value;
        }
  
        socketChat.emit('acceptRoomInvitation', data);
      };
  
      const declineInvitation = () => {
        socketChat.emit('declineRoomInvitation', {
          channelName: props.room.roomName,
          inviterUsername: props.room.inviterUsername
        });
      };
  
      return {
        password,
        acceptInvitation,
        declineInvitation
      };
    }
  };
  </script>
  
<template>
    <div class="dm-container" v-cloak>
      <!-- Room List -->
      <div v-if="rooms.length" class="rooms-list">
        <div v-for="room in rooms" :key="room.id"
             @click="selectRoom(room)"
             :class="{ active: selectedRoom === room }">
          <span class="chat-name">{{ room.roomName }}</span>
          <see-setting :channel-name="room.roomName"></see-setting>
        </div>
      </div>
  
      <!-- Separator -->
      <div class="vertical-separator"></div>
  
      <!-- Chat Window -->
      <div v-if="selectedRoom" class="selected-chat">
        <h3>{{ selectedRoom.roomName }}</h3>
        <ul>
          <li v-for="message in selectedRoom.messages" :key="message.id">
            {{ getSenderName(message) }}: {{ message.text }}
          </li>
        </ul>
        <send-chat :selected-room="selectedRoom"></send-chat>
      </div>
    </div>
  </template>
  
<script>
import SendChat from './sendChat.vue';
import SeeSetting from './seeSetting.vue';
  
export default {
    components: { SendChat, SeeSetting },
  
    data() {
        return {
            rooms: [],
            selectedRoom: null,
            processedMessageIds: [],
            listenersAttached: false
        };
    },
  
    computed: {
        socketChat() {
            return this.$store.getters.socketChat;
        }
    },
  
      methods: {
          selectRoom(room) {
              this.selectedRoom = room;
          },
          getSenderName(message) {
              const user = this.selectedRoom.userDTOs.find(u => u.id === message.senderId);
              return user ? user.username : 'Unknown User';
          },
          isNewMessage(messageId) {
              return !this.processedMessageIds.includes(messageId);
          },
        updateRooms(rooms) {
            this.rooms = rooms;
            this.$nextTick(() => {
                const previouslySelectedRoomName = this.selectedRoom ? this.selectedRoom.roomName : null;
                if (previouslySelectedRoomName) {
                    this.selectedRoom = this.rooms.find(r => r.roomName === previouslySelectedRoomName);
                }
            });
        },

        addMessageToRoom() {
            this.socketChat.emit('emitRooms');
        }
    },
  
      mounted() {
          if (!this.socketChat) {
              console.error("Socket Chat not initialized!");
              return;
          }
          
          this.socketChat.emit('emitRooms');
          this.socketChat.on('emitRooms', this.updateRooms);
          this.socketChat.on('sendMessage', this.addMessageToRoom);
          this.listenersAttached = true;
      },
  
      beforeDestroy() {
          if (!this.socketChat) return;
          
          this.socketChat.off('emitRooms', this.updateRooms);
          this.socketChat.off('sendMessage', this.addMessageToRoom);
          this.processedMessageIds = [];
          this.listenersAttached = false;
      },
  };
  </script>
  

  
<style scoped>
[v-cloak] {
    display: none;
}
  .dm-container {
    display: flex;
  }
  
  .rooms-list {
    width: 250px;
    overflow-y: auto;
    border-right: 1px solid #2fe8ee;
    padding: 1rem;
  }
  
  .vertical-separator {
    width: 1px;
    background-color: #2fe8ee;
    height: 100%;
  }
  
  .selected-chat {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .chat-name {
    color: #2fe8ee;
    cursor: pointer;
    transition: color 0.3s;
    margin-bottom: 0.5rem;
  }
  
  .chat-name:hover {
    color: black;
  }
  </style>
  
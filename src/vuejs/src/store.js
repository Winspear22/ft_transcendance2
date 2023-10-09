import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    isTwoFaActivated: false,
    accessToken: localStorage.getItem('accessToken') || null, // initialisez avec la valeur de localStorage si disponible
    socketDm: null,
    socketChat: null,
    gameSocket: null,
    firstConnection: true,

  },

  mutations: {
    SET_AUTHENTICATED(state, value) {
      state.isAuthenticated = value;
    },
    SET_TWO_FA_ACTIVATED(state, value) {
      state.isTwoFaActivated = value;
    },
    SET_ACCESS_TOKEN(state, token) {
      state.accessToken = token;
      localStorage.setItem('accessToken', token);
    },
    SET_SOCKET_DM(state, socketDm) {
      state.socketDm = socketDm;
    },
    SET_SOCKET_CHAT(state, socketChat) {
      state.socketChat = socketChat;
    },
    SET_GAMESOCKET(state, gameSocket) {
      state.gameSocket = gameSocket;
    },
    SET_FIRST_CONNECTION(state, value) {
      state.firstConnection = value;
    }
    
  },

  actions: {
    authenticate({ commit }, value) {
      commit('SET_AUTHENTICATED', value);
    },
    activateTwoFa({ commit }, value) {
      commit('SET_TWO_FA_ACTIVATED', value);
    },
    setToken({ commit }, token) {
      commit('SET_ACCESS_TOKEN', token);
    },
    setsocketDm({ commit }, socketDm) {
      commit('SET_SOCKET_DM', socketDm);
    },
    setsocketChat({ commit }, socketChat) {
      commit('SET_SOCKET_CHAT', socketChat);
    },
    setGameSocket({ commit }, gameSocket) {
      commit('SET_GAMESOCKET', gameSocket);
    },
    setFirstConnection({ commit }, value) {
      commit('SET_FIRST_CONNECTION', value);
    },
    disconnectAllSockets({ state }) {
      if (state.socketDm) {
        state.socketDm.disconnect();
      }
      if (state.socketChat) {
        state.socketChat.disconnect();
      }
      if (state.gameSocket) {
        state.gameSocket.disconnect();
      }
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    isTwoFaActivated: state => state.isTwoFaActivated,
    accessToken: state => state.accessToken,
    socketDm: state => state.socketDm,
    socketChat: state => state.socketChat,
    gameSocket: state => state.gameSocket,
    firstConnection: state => state.firstConnection,
  }
});
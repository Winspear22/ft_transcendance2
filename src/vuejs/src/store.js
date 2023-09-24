import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    isTwoFaActivated: false,
    accessToken: null,
    socketDm: null,
    socketChat: null,
    gameSocket: null
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
    },
    SET_SOCKET_DM(state, socketDm) {
      state.socketDm = socketDm;
    },
    SET_SOCKET_CHAT(state, socketChat) {
      state.socketChat = socketChat;
    },
    SET_GAMESOCKET(state, gameSocket) {
      state.gameSocket = gameSocket;
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
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    isTwoFaActivated: state => state.isTwoFaActivated,
    accessToken: state => state.accessToken,
    socketDm: state => state.socketDm,
    socketChat: state => state.socketChat,
    gameSocket: state => state.gameSocket
  }
});
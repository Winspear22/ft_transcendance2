import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    isTwoFaActivated: false,
    accessToken: null,
    socket: null
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
    SET_SOCKET(state, socket) {
      state.socket = socket;
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
    setSocket({ commit }, socket) {
      commit('SET_SOCKET', socket);
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    isTwoFaActivated: state => state.isTwoFaActivated,
    accessToken: state => state.accessToken,
    socket: state => state.socket
  }
});
import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    isTwoFaActivated: false,
    accessToken: null
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
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    isTwoFaActivated: state => state.isTwoFaActivated,
    accessToken: state => state.accessToken
  }
});

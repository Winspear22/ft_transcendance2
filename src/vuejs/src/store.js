import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,   // état de connexion de l'utilisateur
    isTwoFaActivated: false,  // 2FA est actif ou non
    accessToken: null         // token d'accès de l'utilisateur
  },

  mutations: {
    // mutation pour définir l'état de connexion
    SET_AUTHENTICATED(state, value) {
      state.isAuthenticated = value;
    },

    // mutation pour définir l'état de 2FA
    SET_TWO_FA_ACTIVATED(state, value) {
      state.isTwoFaActivated = value;
      console.log("STATE QR IN STORE", state.isTwoFaActivated);
    },

    // mutation pour définir le token d'accès
    SET_ACCESS_TOKEN(state, token) {
      state.accessToken = token;
    }
  },

  actions: {
    // action pour définir l'état de connexion
    authenticate({ commit }, value) {
      commit('SET_AUTHENTICATED', value);
    },

    // action pour définir l'état de 2FA
    activateTwoFa({ commit }, value) {
      commit('SET_TWO_FA_ACTIVATED', value);
    },

    // action pour définir le token d'accès
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
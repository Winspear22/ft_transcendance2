import { createStore } from 'vuex';

export default createStore({
  state: {
    token: null,
    userIsAuthenticated: false,  // nouvel état pour gérer l'authentification de l'utilisateur
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      state.userIsAuthenticated = !!token;  // Si un token est défini, l'utilisateur est considéré comme authentifié
    },
    SET_USER_AUTHENTICATION(state, isAuthenticated) {
      state.userIsAuthenticated = isAuthenticated;
    }
  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token);
    },
    setUserAuthentication({ commit }, isAuthenticated) {
      commit('SET_USER_AUTHENTICATION', isAuthenticated);
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.userIsAuthenticated;  // basé sur le nouvel état userIsAuthenticated
    }
  }
});

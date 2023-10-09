import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import Notification from '@kyvg/vue3-notification';

const app = createApp(App);
app.use(store);
app.use(router);
app.use(Notification);

app.mount('#app');

window.addEventListener('storage', function(event) {
    if (event.key === 'accessToken') {
        // Informer votre store du nouveau token
        store.dispatch('setToken', event.newValue);
    }
});
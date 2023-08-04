
import App from './App.vue';
import loginPage from './login/loginPage.vue';
import welcomePage from './welcome/welcomePage.vue';
import settingPage from './setting/settingPage.vue';

const appRoutes = [
    {
        path: '/',
        name: 'Home',
        component: App,
        meta: {
            title: 'P O N G'
        }
    },
    {
        path: '/loginPage',
        name: 'loginPage',
        component: loginPage,
        meta: {
            title: 'P O N G - login'
        }
    },
    {
        path: '/welcomePage',
        name: 'welcomePage',
        component: welcomePage,
        meta: {
            title: 'P O N G _ welcome'
        }
    },
    {
        path: '/settingPage',
        name: 'settingPage',
        component: settingPage,
        meta: {
            title: 'P O N G _ setting'
        }
    },
]

export default appRoutes;
import loginPage from './components/loginPage.vue';


const appRoutes = [
    {
        path: '/',
        name: 'Home',
        component: loginPage,
        meta: {
            title: 'P O N G'
        }
    }
]

export default appRoutes;
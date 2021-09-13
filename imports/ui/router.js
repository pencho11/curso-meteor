import Vue from 'vue';
import VueRouter from 'vue-router';
import store  from './store';
import routes from './routes/routes';

Vue.use(VueRouter);
const router = new VueRouter({
    mode: 'history',
    routes
}); 

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth); 
    const isLogged = store.state.auth.isLogged;
    if (!requiresAuth && isLogged && to.name === 'login') {
        next('/'); 
    } else if (requiresAuth && !isLogged) {
        next('/login');
    } else {
        const permission = to.meta.permission;
        if (permission) {
            Meteor.call('permission.check', {permission}, (error, response) => {
                if (error) {
                    this.$alert.showAlertSimple('error', error.reason);
                } else if (response.data.hasPermission){
                    next();
                } else {
                    next(from.path);
                    console.warn('You do not have access to this section');
                }
            });
        } else {
            next();
        }
    }
});

export default router;
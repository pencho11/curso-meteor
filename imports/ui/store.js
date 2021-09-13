import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import auth from './modules/authentication';
import temporal from './modules/temporal';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence( {
    storage: window.localStorage,
    modules: ['auth', 'temporal']
});

export default new Vuex.Store( {
    modules: {
        auth,
        temporal
    },
    plugins: [vuexLocal.plugin]
});
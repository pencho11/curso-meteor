import {Meteor} from 'meteor/meteor';
import Vue from 'vue';
import vuetify from '../../ui/plugins/vuetify';
import '../../ui/plugins/index'

//main app
import App from '/imports/ui/App';
import router from '../../ui/router';
import store from '../../ui/store';
import '../../ui/directives'; 

Meteor.startup(()=>{
    new Vue({
        router,
        store,
        vuetify,
        render:h=>h(App)
    }).$mount("app");
})
var require = meteorInstall({"imports":{"ui":{"components":{"utilities":{"Alerts":{"AlertMessage.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/components/utilities/Alerts/AlertMessage.vue                                                         //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: 'AlertMessage',
  data: function () {
    return {
      snackbar: false,
      x: '',
      y: '',
      color: '',
      mode: '',
      icon: null,
      title: '',
      text: '',
      timeout: 6000
    };
  },
  mounted: function () {
    Vue.prototype.$alert = this;
  },
  methods: {
    showAlertSimple: function (color, title) {
      this.color = color;
      this.title = title;
      this.x = "right";
      this.y = "bottom";

      if (color === "success") {
        this.icon = 'check_circle';
      } else if (color === "error") {
        this.icon = 'close';
      } else if (color === "info") {
        this.icon = 'info';
      } else if (color === "warning") {
        this.icon = 'warning';
      }

      this.text = '';
      this.mode = '';
      this.timeout = 6000;
      this.snackbar = true;
    },

    /**
     * Show the alert with all configuration options
     * @param icon Alert's icon
     * @param color Alert's color: success, error, info, primary, warning
     * @param title mode: vertical, milti-line or empty string '' for center
     * @param title timeout: timeout to disappear the alert: top or bottom
     * @param title text Alert text
     */
    showAlertFull: function (icon, color, title, mode, timeout, x, y) {
      var text = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
      this.icon = icon;
      this.color = color;
      this.text = text;
      this.mode = mode;
      this.timeout = timeout;
      this.x = x;
      this.y = y;
      this.snackbar = true;
      this.title = title;
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-snackbar',{attrs:{"bottom":_vm.y==='bottom',"top":_vm.y==='top',"right":_vm.x==='right',"left":_vm.x==='left',"color":_vm.color,"multi-line":_vm.mode==='multi-line',"vertical":_vm.mode==='vertical',"timeout":_vm.timeout},model:{value:(_vm.snackbar),callback:function ($$v) {_vm.snackbar=$$v},expression:"snackbar"}},[_c('v-card',{attrs:{"color":"transparent","elevation":"0"}},[_c('v-card-title',[(_vm.icon)?_c('v-icon',{attrs:{"dark":"","left":""}},[_vm._v("\n                "+_vm._s(_vm.icon)+"\n            ")]):_vm._e(),_vm._v(" "),_c('span',{staticClass:"white--text"},[_vm._v(_vm._s(_vm.title))]),_vm._v(" "),_c('v-spacer'),_vm._v(" "),_c('v-tooltip',{attrs:{"bottom":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-btn',_vm._g({attrs:{"dark":"","text":"","small":""},on:{"click":function($event){_vm.snackbar=false}}},on),[_c('v-icon',{attrs:{"small":""}},[_vm._v("mdi-window-close")])],1)]}}])},[_vm._v(" "),_c('span',[_vm._v("Cerrar")])])],1),_vm._v(" "),(_vm.text)?_c('v-card-text',[_c('span',{staticClass:"white--text"},[_vm._v(_vm._s(_vm.text))])]):_vm._e()],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-2cc02c84';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'alert-message';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-2cc02c84'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-2cc02c84', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Loaders":{"Loader.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/components/utilities/Loaders/Loader.vue                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "Loader",
  data: function () {
    return {
      loader: false,
      progressLabel: ''
    };
  },
  mounted: function () {
    Vue.prototype.$loader = this;
  },
  methods: {
    activate: function () {
      var progressLabel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Cargando. . .';
      this.loader = true;
      this.progressLabel = progressLabel;
    },
    desactivate: function () {
      this.loader = false;
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-dialog',{attrs:{"hide-overlay":"","persistent":"","width":"300"},model:{value:(_vm.loader),callback:function ($$v) {_vm.loader=$$v},expression:"loader"}},[_c('v-card',{attrs:{"color":"primary","dark":""}},[_c('v-card-text',[_vm._v("\n            "+_vm._s(_vm.progressLabel)+"\n            "),_c('v-progress-linear',{staticClass:"mb-0",attrs:{"indeterminate":"","color":"white"}})],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-af8c65d2';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'loader';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-af8c65d2'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-af8c65d2', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Modals":{"ModalRemove.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/components/utilities/Modals/ModalRemove.vue                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "ModalRemove",
  props: ['modalData'],
  data: function () {
    return {
      dialog: false
    };
  },
  methods: {
    removeElement: function () {
      this.$emit('id_element', this.modalData._id);
      this.dialog = false;
    },
    cancel: function () {
      this.dialog = false;
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-dialog',{attrs:{"id":"modalRemove","max-width":"500px"},model:{value:(_vm.dialog),callback:function ($$v) {_vm.dialog=$$v},expression:"dialog"}},[_c('v-card',[_c('v-card-title',{staticClass:"headline"},[_c('div',{staticClass:"title"},[_vm._v("\n                Eliminar "+_vm._s(_vm.modalData.typeElement)+"\n            ")])]),_vm._v(" "),_c('v-card-text',[_vm._v("\n            ¿Estas seguro de eliminar "+_vm._s(_vm.modalData.preposition)+"\n            "+_vm._s(_vm.modalData.typeElement)+"\n            "+_vm._s(_vm.modalData.mainNameElement)+"?\n        ")]),_vm._v(" "),_c('v-card-actions',[_c('v-spacer'),_vm._v(" "),_c('v-btn',{attrs:{"color":"default","text":""},on:{"click":_vm.cancel}},[_vm._v("\n                Cancelar\n            ")]),_vm._v(" "),_c('v-btn',{attrs:{"color":"error","depressed":""},on:{"click":_vm.removeElement}},[_vm._v("\n                Eliminar\n            ")])],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-0fade17d';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'modal-remove';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-0fade17d'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-0fade17d', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"ConfigureAccount":{"GeneralData.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/components/ConfigureAccount/GeneralData.vue                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
var mapMutations;
module.link("vuex", {
  mapMutations: function (v) {
    mapMutations = v;
  }
}, 0);
var uploadImage;
module.link("../../mixins/users/uploadImage", {
  "default": function (v) {
    uploadImage = v;
  }
}, 1);
module.exportDefault({
  name: "GeneralData",
  mixins: [uploadImage],
  data: function () {
    return {
      user: {
        _id: null,
        username: null,
        emails: [{
          address: null,
          verified: false
        }],
        profile: {
          profile: null,
          name: null,
          path: null
        }
      }
    };
  },
  created: function () {
    var user = this.$store.state.auth.user;
    this.user = {
      _id: user._id,
      username: user.username,
      emails: user.emails,
      profile: user.profile
    };
  },
  methods: _objectSpread({}, mapMutations('auth', ['setUser']), {
    saveUser: function () {
      var _this = this;

      this.$loader.activate('Actualizando datos. . .');
      Meteor.call('user.updatePersonalData', {
        user: this.user,
        photoFileUser: this.photoFileUser
      }, function (error, response) {
        _this.$loader.desactivate();

        if (error) {
          _this.$alert.showAlertSimple('error', error.reason);
        } else {
          _this.setUser(Meteor.user());

          _this.$root.$emit('setUserLogged');

          _this.$alert.showAlertSimple('success', response.message);
        }
      });
    }
  })
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-form',{on:{"submit":function($event){$event.preventDefault();return _vm.saveUser($event)}}},[_c('v-card',[_c('v-card-title',[_c('div',{staticClass:"subtitle-2"},[_vm._v("\n                DATOS GENERALES\n            ")])]),_vm._v(" "),_c('v-row',[_c('v-col',{staticClass:"pl-10",attrs:{"cols":"12","sm":"12","md":"3","lg":"3"}},[_c('img',{attrs:{"src":_vm.user.profile.path || '/img/user.png',"alt":_vm.user.profile.name,"width":"100px"}}),_vm._v(" "),_c('v-file-input',{directives:[{name:"show",rawName:"v-show",value:(false),expression:"false"}],ref:"imageFile",attrs:{"accept":"image/png, image/jpeg, image/bmp"},model:{value:(_vm.file),callback:function ($$v) {_vm.file=$$v},expression:"file"}}),_vm._v(" "),_c('v-btn',{staticClass:"mb-5 mt-5",attrs:{"color":"primary","width":"100%","rounded":"","depressed":""},on:{"click":_vm.onClickUploadButton}},[(_vm.user.profile.path)?_c('span',[_vm._v("Cambiar")]):_c('span',[_vm._v("Cargar")])])],1),_vm._v(" "),_c('v-col',{attrs:{"cols":"12","sm":"12","md":"9","lg":"9"}},[_c('v-card-text',[_c('v-text-field',{attrs:{"id":"inputName","name":"name","label":"Nombre completo"},model:{value:(_vm.user.profile.name),callback:function ($$v) {_vm.$set(_vm.user.profile, "name", $$v)},expression:"user.profile.name"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputUsername","name":"username","label":"Usuario"},model:{value:(_vm.user.username),callback:function ($$v) {_vm.$set(_vm.user, "username", $$v)},expression:"user.username"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputEmail","name":"email","label":"Correo electronico"},model:{value:(_vm.user.emails[0].address),callback:function ($$v) {_vm.$set(_vm.user.emails[0], "address", $$v)},expression:"user.emails[0].address"}}),_vm._v(" "),_c('div',{staticClass:"d-flex justify-center"},[_c('v-btn',{attrs:{"type":"submit","color":"primary","rounded":"","depressed":""}},[_vm._v("\n                            Guardar\n                        ")])],1)],1)],1)],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-15dc427a';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'general-data';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-15dc427a'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-15dc427a', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"UpdatePassword.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/components/ConfigureAccount/UpdatePassword.vue                                                       //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "UpdatePassword",
  data: function () {
    return {
      password: {
        old: null,
        "new": null,
        confirm: null
      },
      showPass: {
        old: null,
        "new": null,
        confirm: null
      }
    };
  },
  methods: {
    updatePassword: function () {
      var _this = this;

      Accounts.changePassword(this.password.old, this.password.new, function (error) {
        if (error) {
          _this.$alert.showAlertSimple('error', 'Ocurrio un error al cambiar la contraseña.');
        } else {
          _this.password = {
            old: null,
            "new": null,
            confirm: null
          };

          _this.$alert.showAlertSimple('success', 'Se ha cambiado la contraseña.');
        }
      });
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-form',{on:{"submit":function($event){$event.preventDefault();return _vm.updatePassword($event)}}},[_c('v-card',[_c('v-card-title',[_c('div',{staticClass:"subtitle-2"},[_vm._v("CAMBIO DE CONTRASEÑA")])]),_vm._v(" "),_c('v-card-text',[_c('v-text-field',{attrs:{"id":"inputPassword","append-icon":_vm.showPass.old?'mdi-eye':'mdi-eye-off',"type":_vm.showPass.old?'text':'password',"name":"current_password","label":"Contraseña actual","autocomplete":"off"},on:{"click:append":function($event){_vm.showPass.old= !_vm.showPass.old}},model:{value:(_vm.password.old),callback:function ($$v) {_vm.$set(_vm.password, "old", $$v)},expression:"password.old"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputNewPassword","append-icon":_vm.showPass.new?'mdi-eye':'mdi-eye-off',"type":_vm.showPass.new?'text':'password',"name":"password","label":"Nueva contraseña","autocomplete":"new password"},on:{"click:append":function($event){_vm.showPass.new= !_vm.showPass.new}},model:{value:(_vm.password.new),callback:function ($$v) {_vm.$set(_vm.password, "new", $$v)},expression:"password.new"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputConfirmPassword","append-icon":_vm.showPass.confirm?'mdi-eye':'mdi-eye-off',"type":_vm.showPass.confirm?'text':'password',"name":"password_confirmation","label":"Confirmar contraseña"},on:{"click:append":function($event){_vm.showPass.confirm= !_vm.showPass.confirm}},model:{value:(_vm.password.confirm),callback:function ($$v) {_vm.$set(_vm.password, "confirm", $$v)},expression:"password.confirm"}}),_vm._v(" "),_c('v-card-actions',[_c('v-row',{attrs:{"justify":"center"}},[_c('v-btn',{attrs:{"type":"submit","color":"primary","rounded":"","depressed":""}},[_vm._v("Cambiar")])],1)],1)],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-5c1ea0ec';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'update-password';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-5c1ea0ec'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-5c1ea0ec', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"UserLogged":{"UserLogged.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/components/UserLogged/UserLogged.vue                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
var mapMutations;
module.link("vuex", {
  mapMutations: function (v) {
    mapMutations = v;
  }
}, 0);
module.exportDefault({
  name: "UserLogged",
  data: function () {
    return {
      user: {
        username: null
      },
      onLogoutHook: null
    };
  },
  created: function () {
    this.setSession();
  },
  mounted: function () {
    var _this = this;

    this.$root.$on('setUserLogged', function () {
      _this.setSession();
    });
    this.onLogoutHook = Accounts.onLogout(function () {
      _this.closeFrontSession();
    });
  },
  methods: _objectSpread({}, mapMutations('auth', ['logout']), {
    closeSession: function () {
      this.onLogoutHook.stop();
      Meteor.logout();
      this.logout();
      this.$router.push({
        name: 'login'
      });
    },
    closeFrontSession: function () {
      this.onLogoutHook.stop();
      this.logout();
      this.$router.push({
        name: 'login'
      });
    },
    setSession: function () {
      if (Meteor.userId() !== null) {
        this.user = this.$store.state.auth.user;
      } else {
        this.closeSession();
      }
    }
  })
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-menu',{attrs:{"offset-y":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-btn',_vm._g({staticClass:"mr-5",attrs:{"color":"default","dark":"","text":""}},on),[_vm._v("\n            "+_vm._s(_vm.user.username)+"\n            "),_c('v-icon',[_vm._v("keyboard_arrow_down")])],1)]}}])},[_vm._v(" "),_c('v-list',[_c('v-list-item',{attrs:{"to":{name:'home.account'}}},[_vm._v("Cuenta")]),_vm._v(" "),_c('v-list-item',{on:{"click":_vm.closeSession}},[_vm._v("Cerrar sesion")])],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-75ee5f8f';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'user-logged';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-75ee5f8f'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-75ee5f8f', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"layouts":{"shared":{"FooterView.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/layouts/shared/FooterView.vue                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "FooterView"
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-footer',{attrs:{"padless":""}},[_c('v-col',{staticClass:"d-flex justify-center",attrs:{"cols":"12"}},[_c('span',{staticClass:"white--text"},[_vm._v("\n            DFE Developer Front-End\n        ")])])],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-6aba7c8a';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'footer-view';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-6aba7c8a'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-6aba7c8a', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"HeaderView.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/layouts/shared/HeaderView.vue                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var UserLogged;
module.link("../../components/UserLogged/UserLogged", {
  "default": function (v) {
    UserLogged = v;
  }
}, 0);
module.exportDefault({
  name: "HeaderView",
  components: {
    UserLogged: UserLogged
  },
  data: function () {
    return {
      optionSelected: 0,
      options: []
    };
  },
  created: function () {
    var _this = this;

    Meteor.call('user.getSystemOptions', function (error, response) {
      if (error) {
        _this.$alert.showAlertSimple('error', error.response);
      } else {
        _this.options = response.data;

        _this.updateSelectedOption();
      }
    });
  },
  watch: {
    '$route': function () {
      this.updateSelectedOption();
    }
  },
  methods: {
    goToView: function (option) {
      this.$router.push({
        name: option.routeName
      });
    },
    updateSelectedOption: function () {
      var _this2 = this;

      var optionSelected = this.options.find(function (option) {
        return option.routeName === _this2.$route.name;
      });
      this.optionSelected = optionSelected ? this.options.indexOf(optionSelected) : this.optionSelected;
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app-bar',{attrs:{"app":"","dark":"","dense":"","src":"https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"},scopedSlots:_vm._u([{key:"extension",fn:function(){return [_c('v-tabs',{attrs:{"align-with-title":""},model:{value:(_vm.optionSelected),callback:function ($$v) {_vm.optionSelected=$$v},expression:"optionSelected"}},_vm._l((_vm.options),function(option){return _c('v-tab',{key:option.title,domProps:{"textContent":_vm._s(option.title)},on:{"click":function($event){return _vm.goToView(option)}}})}),1)]},proxy:true}])},[_c('v-toolbar-title',[_vm._v("Scaffold Meteor + Vue")]),_vm._v(" "),_c('v-spacer'),_vm._v(" "),_c('user-logged')],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-f98446a6';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'header-view';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-f98446a6'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-f98446a6', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"LytAuth.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/layouts/LytAuth.vue                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "LytAuth"
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-row',[_c('v-col',{staticClass:"d-flex flex-column justify-space-around pa-12",attrs:{"xs":"12","sm":"8","md":"4"}},[_c('div',{staticClass:"text-center"},[_c('img',{attrs:{"src":"/img/vuetify.png","alt":"Vuetify","height":"180px","width":"auto"}})]),_vm._v(" "),_c('router-view',{attrs:{"name":"sectionView"}}),_vm._v(" "),_c('div',{staticClass:"text-center"},[_c('img',{attrs:{"src":"/img/Powered.png","alt":"Diseño","id":"poweredLogo","height":"35px"}})])],1),_vm._v(" "),_c('v-col',{staticClass:"right-side d-flex flex-column justify-center",attrs:{"xs":"12","sm":"4","md":"8"}},[_c('div',{staticClass:"display-3 font-weight-medium mr-10 text-right white--text"},[_vm._v("\n            Scaffold Meteor + Vue\n        ")])])],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-5c92ee40';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'lyt-auth';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-5c92ee40'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-5c92ee40', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"LytSPA.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/layouts/LytSPA.vue                                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var HeaderView;
module.link("./shared/HeaderView", {
  "default": function (v) {
    HeaderView = v;
  }
}, 0);
var FooterView;
module.link("./shared/FooterView", {
  "default": function (v) {
    FooterView = v;
  }
}, 1);
module.exportDefault({
  name: "LytSPA",
  components: {
    HeaderView: HeaderView,
    FooterView: FooterView
  },
  data: function () {
    return {
      loggedUser: false
    };
  },
  mounted: function () {
    this.$subscribe('roles', []);
  },
  watch: {
    '$subReady.roles': function (newValue) {
      this.loggedUser = true;
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',{attrs:{"fluid":""}},[_c('header-view'),_vm._v(" "),_c('v-main',{attrs:{"id":"main_section"}},[(_vm.loggedUser)?_c('router-view',{attrs:{"name":"sectionView"}}):_vm._e()],1),_vm._v(" "),_c('footer-view')],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-70df483c';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'lyt-s-p-a';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-70df483c'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-70df483c', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"mixins":{"helpers":{"date.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/mixins/helpers/date.js                                                                               //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.exportDefault({
  methods: {
    currentLocalDate: function () {
      var date = new Date();
      var offsetMs = date.getTimezoneOffset() * 60 * 1000;
      var msLocal = date.getTime() - offsetMs;
      return new Date(msLocal);
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"users":{"uploadImage.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/mixins/users/uploadImage.js                                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.exportDefault({
  data: function () {
    return {
      file: null,
      photoFileUser: null
    };
  },
  watch: {
    file: function (newFile) {
      if (newFile && typeof FileReader != 'undefined') {
        var reader = new FileReader();

        reader.onload = function (ev) {
          this.user.profile.path = ev.target.result;
          this.photoFileUser = ev.target.result;
        }.bind(this);

        reader.readAsDataURL(newFile);
      }
    }
  },
  methods: {
    onClickUploadButton: function () {
      this.$refs.imageFile.$refs.input.click();
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"modules":{"authentication":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/modules/authentication/index.js                                                                      //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var state;
module.link("./state", {
  "default": function (v) {
    state = v;
  }
}, 0);
var mutations;
module.link("./mutations", {
  "*": function (v) {
    mutations = v;
  }
}, 1);
module.exportDefault({
  namespaced: true,
  mutations: mutations,
  state: state
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mutations.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/modules/authentication/mutations.js                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({
  setUser: function () {
    return setUser;
  },
  logout: function () {
    return logout;
  }
});

var setUser = function (state, user) {
  state.user = user;
  state.isLogged = true;
};

var logout = function (state) {
  state.user = null;
  state.isLogged = false;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"state.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/modules/authentication/state.js                                                                      //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.exportDefault({
  user: null,
  isLogged: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"temporal":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/modules/temporal/index.js                                                                            //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var state;
module.link("./state", {
  "default": function (v) {
    state = v;
  }
}, 0);
var mutations;
module.link("./mutations", {
  "*": function (v) {
    mutations = v;
  }
}, 1);
module.exportDefault({
  namespaced: true,
  mutations: mutations,
  state: state
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mutations.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/modules/temporal/mutations.js                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({
  setElement: function () {
    return setElement;
  }
});

var setElement = function (state, element) {
  state.element = element;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"state.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/modules/temporal/state.js                                                                            //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.exportDefault({
  elment: null
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"views":{"Account":{"ConfigureAccount.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Account/ConfigureAccount.vue                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var GeneralData;
module.link("../../components/ConfigureAccount/GeneralData", {
  "default": function (v) {
    GeneralData = v;
  }
}, 0);
var UpdatePassword;
module.link("../../components/ConfigureAccount/UpdatePassword", {
  "default": function (v) {
    UpdatePassword = v;
  }
}, 1);
module.exportDefault({
  name: "ConfigureAccount",
  components: {
    GeneralData: GeneralData,
    UpdatePassword: UpdatePassword
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',[_c('v-row',[_c('v-col',[_c('div',{staticClass:"headline"},[_vm._v("Configurar cuenta")])])],1),_vm._v(" "),_c('v-row',[_c('v-col',{attrs:{"cols":"12","xs":"12","sm":"12","md":"6","lg":"6","xl":"5"}},[_c('general-data')],1),_vm._v(" "),_c('v-col',{attrs:{"cols":"12","xs":"12","sm":"12","md":"6","lg":"6","offset-xl":"1","xl":"5"}},[_c('update-password')],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-3476f983';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'configure-account';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-3476f983'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-3476f983', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Auth":{"ForgotPassword.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Auth/ForgotPassword.vue                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "ForgotPassword",
  data: function () {
    return {
      user: {
        email: null
      }
    };
  },
  methods: {
    forgotPassword: function () {
      var _this = this;

      Accounts.forgotPassword(this.user, function (error) {
        if (error) {
          console.error('Error sending email: ', error);

          _this.$alert.showAlertSimple('error', 'Ocurrio un error al enviar el correo');
        } else {
          _this.$alert.showAlertSimple('success', 'Correo enviado! Por favor abra su correo electronico y haga click en el enlace del mensaje que le enviamos');

          setTimeout(function () {
            _this.$router.push({
              name: login
            });
          }, 5000);
        }
      });
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',{staticClass:"d-flex flex-row justify-start"},[_c('v-btn',{attrs:{"color":"primary","icon":"","to":{name:'login'}}},[_c('v-icon',[_vm._v("arrow_back")])],1),_vm._v(" "),_c('div',{staticClass:"title"},[_vm._v("Olvidé mi contraseña")])],1),_vm._v(" "),_c('v-form',{on:{"submit":function($event){$event.preventDefault();return _vm.forgotPassword($event)}}},[_c('v-text-field',{attrs:{"id":"inputEmail","name":"email","type":"email","label":"Correo electronico"},model:{value:(_vm.user.email),callback:function ($$v) {_vm.$set(_vm.user, "email", $$v)},expression:"user.email"}}),_vm._v(" "),_c('v-btn',{attrs:{"type":"submit","color":"primary","rounded":""}},[_vm._v("Recuperar")])],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-d3c12c4a';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'forgot-password';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-d3c12c4a'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-d3c12c4a', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Login.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Auth/Login.vue                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
var mapMutations;
module.link("vuex", {
  mapMutations: function (v) {
    mapMutations = v;
  }
}, 0);
module.exportDefault({
  name: "Login",
  data: function () {
    return {
      user: {
        userOrEmail: null,
        password: null
      }
    };
  },
  methods: _objectSpread({}, mapMutations('auth', ['setUser']), {
    Login: function () {
      var _this = this;

      Meteor.loginWithPassword(this.user.userOrEmail, this.user.password, function (error) {
        if (error) {
          console.error('Error in login', error);

          if (error.error === '403') {
            _this.$alert.showAlertFull('mdi-close-circle', 'warning', error.reason, '', 5000, 'center', 'bottom');
          } else {
            _this.$alert.showAlertSimple('error', 'Credenciales incorrectas');
          }
        } else {
          Meteor.logoutOtherClients(function (err) {
            console.error('Error al cerrar sesion en otros clientes', err);
          });

          _this.setUser(Meteor.user());

          _this.$router.push({
            name: 'home'
          });
        }
      });
    }
  })
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"login-wrapper"},[_c('div',{staticClass:"tittle secondary--text"},[_vm._v("Bienvenido!")]),_vm._v(" "),_c('div',{staticClass:"display-1 mb-0 secondary--text"},[_vm._v("Iniciar sesión")]),_vm._v(" "),_c('v-form',{attrs:{"aria-autocomplete":"none"},on:{"submit":function($event){$event.preventDefault();return _vm.Login($event)}}},[_c('v-text-field',{attrs:{"id":"inputUser","autocompete":"off","label":"Usuario","name":"email","prepend-icon":"person","color":"primary","type":"text"},model:{value:(_vm.user.userOrEmail),callback:function ($$v) {_vm.$set(_vm.user, "userOrEmail", $$v)},expression:"user.userOrEmail"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputPassword","label":"Contraseña","name":"password","prepend-icon":"lock","type":"password"},model:{value:(_vm.user.password),callback:function ($$v) {_vm.$set(_vm.user, "password", $$v)},expression:"user.password"}}),_vm._v(" "),_c('div',{staticClass:"d-flex justify-end"},[_c('v-btn',{attrs:{"color":"primary","text":"","to":{name:'forgotPassword'},"small":""}},[_vm._v("¿Olvide mi Contraseña?")])],1),_vm._v(" "),_c('div',{staticClass:"d-flex justify-start"},[_c('v-btn',{attrs:{"type":"submit","rounded":"","color":"primary","transition":"fade"}},[_vm._v("Entrar")])],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-93246f08';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'login';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-93246f08'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-93246f08', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ResetPassword.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Auth/ResetPassword.vue                                                                         //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "ResetPassword",
  data: function () {
    return {
      user: {
        password: null,
        confirmPassword: null
      },
      showPass: {
        "new": false,
        confirm: false
      }
    };
  },
  methods: {
    resetPassword: function () {
      var _this = this;

      var token = this.$route.params.token;
      Accounts.resetPassword(token, this.user.password, function (error) {
        if (error) {
          _this.$alert.showAlertSimple('error', 'Se produjo un error al restablecer la contraseña.');
        } else {
          _this.$alert.showAlertSimple('success', 'Se restablecio la contraseña exitosamente.');

          _this.$router.push({
            name: 'login'
          });
        }
      });
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',{staticClass:"title"},[_vm._v("Resetear contraseña")]),_vm._v(" "),_c('v-form',{on:{"submit":function($event){$event.preventDefault();return _vm.resetPassword($event)}}},[_c('v-text-field',{attrs:{"id":"inputPassword","append-icon":_vm.showPass.new ? 'mdi-eye':'mdi-eye-off',"type":_vm.showPass.new ? 'text':'password',"name":"password","label":"Nueva contraseña","autocomplete":"new-password"},on:{"click:append":function($event){_vm.showPass.new=!_vm.showPass.new}},model:{value:(_vm.user.password),callback:function ($$v) {_vm.$set(_vm.user, "password", $$v)},expression:"user.password"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputConfirmPassword","append-icon":_vm.showPass.confirm ? 'mdi-eye':'mdi-eye-off',"type":_vm.showPass.confirm ? 'text':'password',"name":"password_confirmation","label":"Confirmar contraseña","autocomplete":"new-password"},on:{"click:append":function($event){_vm.showPass.confirm=!_vm.showPass.confirm}},model:{value:(_vm.user.confirmPassword),callback:function ($$v) {_vm.$set(_vm.user, "confirmPassword", $$v)},expression:"user.confirmPassword"}}),_vm._v(" "),_c('div',{staticClass:"d-flex start"},[_c('v-btn',{attrs:{"type":"submit","color":"primary","rounded":""}},[_vm._v("Resetear")])],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-c1cf1ac6';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'reset-password';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-c1cf1ac6'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-c1cf1ac6', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SetInitialPasword.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Auth/SetInitialPasword.vue                                                                     //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "SetInitialPasword",
  data: function () {
    return {
      user: {
        password: null,
        confirmPassword: null
      },
      showPass: {
        "new": false,
        confirm: false
      }
    };
  },
  methods: {
    setPassword: function () {
      var _this = this;

      var token = this.$route.params.token;
      Accounts.resetPassword(token, this.user.password, function (error) {
        if (error) {
          _this.$alert.showAlertSimple('error', 'Se produjo un error al establecer la contraseña.');
        } else {
          _this.$alert.showAlertSimple('success', 'Se establecio la contraseña exitosamente.');

          _this.$router.push({
            name: 'login'
          });
        }
      });
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',{staticClass:"title"},[_vm._v("Establecer contraseña")]),_vm._v(" "),_c('v-form',{on:{"submit":function($event){$event.preventDefault();return _vm.setPassword($event)}}},[_c('v-text-field',{attrs:{"id":"inputPassword","append-icon":_vm.showPass.new ? 'mdi-eye':'mdi-eye-off',"type":_vm.showPass.new ? 'text':'password',"name":"password","label":"Nueva contraseña","autocomplete":"new-password"},on:{"click:append":function($event){_vm.showPass.new=!_vm.showPass.new}},model:{value:(_vm.user.password),callback:function ($$v) {_vm.$set(_vm.user, "password", $$v)},expression:"user.password"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputConfirmPassword","append-icon":_vm.showPass.confirm ? 'mdi-eye':'mdi-eye-off',"type":_vm.showPass.confirm ? 'text':'password',"name":"password_confirmation","label":"Confirmar contraseña","autocomplete":"new-password"},on:{"click:append":function($event){_vm.showPass.confirm=!_vm.showPass.confirm}},model:{value:(_vm.user.confirmPassword),callback:function ($$v) {_vm.$set(_vm.user, "confirmPassword", $$v)},expression:"user.confirmPassword"}}),_vm._v(" "),_c('div',{staticClass:"d-flex justify-start mt-2"},[_c('v-btn',{attrs:{"type":"submit","color":"primary","rounded":""}},[_vm._v("Establecer")])],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-75d0f7dd';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'set-initial-pasword';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-75d0f7dd'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-75d0f7dd', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"VerifyEmail.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Auth/VerifyEmail.vue                                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: 'VerifyEmail',
  data: function () {
    return {
      loading: true,
      status: false,
      message: null,
      description: null
    };
  },
  mounted: function () {
    var _this = this;

    var token = this.$route.params.token;
    Accounts.verifyEmail(token, function (error) {
      _this.loading = false;

      if (error) {
        console.error('Verify email failed', error);
        _this.message = 'Ocurrio un error al verificar tu cuenta.';
        _this.description = 'Intenta registrandote de nuevo o usando la opcion de "Olvide mi contraseña"';
        _this.status = false;
      } else {
        _this.message = 'Se ha verificado tu correo exitosamente. Ahora puedes iniciar sesion.';
        _this.status = true;
      }
    });
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"align":"center"}},[(_vm.loading)?_c('div',[_c('h3',[_vm._v("Cargando datos. . .")])]):_c('div',[_c('v-icon',{attrs:{"size":"120","color":_vm.status?'green':'red'}},[_vm._v("\n            "+_vm._s(_vm.status ? 'mdi-check-circle' : 'mdi-cancel')+"\n        ")]),_vm._v(" "),_c('h3',{staticClass:"text-wrap"},[_vm._v("\n            "+_vm._s(_vm.message)+"\n            "),_c('small',{domProps:{"textContent":_vm._s(_vm.description)}})]),_vm._v(" "),_c('v-btn',{attrs:{"to":{name: 'login'},"color":"primary"}},[_vm._v("\n            Regresar a login\n        ")])],1)])};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-0dde7a76';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'verify-email';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-0dde7a76'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-0dde7a76', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Chat":{"Chat.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Chat/Chat.vue                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var Message;
module.link("../../../api/Messages/Message", {
  Message: function (v) {
    Message = v;
  }
}, 0);
var date;
module.link("../../mixins/helpers/date", {
  "default": function (v) {
    date = v;
  }
}, 1);
module.exportDefault({
  name: 'Chat',
  mixins: [date],
  data: function () {
    return {
      contactSelected: null,
      message: {
        idSender: null,
        idReceiver: null,
        date: null,
        text: null,
        read: false
      }
    };
  },
  updated: function () {
    var elem = this.$el.querySelector('#msgContainer');

    if (elem) {
      elem.scrollTop = elem.scrollHeight;
    }
  },
  methods: {
    sendMessage: function () {
      var _this = this;

      this.message.idSender = Meteor.userId();
      this.message.idReceiver = this.contactSelected._id;
      this.message.date = this.currentLocalDate().toISOString();
      Meteor.call('message.save', this.message, function (error, response) {
        if (error) {
          _this.$alert.showAlertSimple('error', error.reason);
        } else {
          _this.message.text = null;
        }
      });
    },
    markMessagesAsRead: function () {
      var _this2 = this;

      var messages = this.messages.filter(function (message) {
        return message.read === false && message.idReceiver === Meteor.userId();
      });

      if (messages.length) {
        Meteor.call('messages.read', messages, function (error) {
          if (error) {
            _this2.$alert.showAlertSimple('error', error.reason);
          }
        });
      }
    }
  },
  meteor: {
    $subscribe: {
      'user.list': [],
      'messages.list': function () {
        return [this.contactSelected ? this.contactSelected._id : null];
      }
    },
    users: function () {
      return Meteor.users.find({
        _id: {
          $ne: Meteor.userId()
        }
      }).fetch();
    },
    messages: function () {
      return this.contactSelected ? Message.find({}, {
        sort: {
          date: 1
        }
      }).fetch() : [];
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',{attrs:{"fluid":""}},[_c('v-row',[_c('v-col',{attrs:{"cols":"12","xs":"12","sm":"4","md":"3","lg":"2","xl":"2"}},[_c('v-card',{staticClass:"mx-auto",attrs:{"max-width":"300","tile":""}},[_c('v-list',{attrs:{"subheader":""}},[_c('v-subheader',[_vm._v("CONTACTOS")]),_vm._v(" "),_c('v-list-item-group',{attrs:{"color":"primary"},model:{value:(_vm.contactSelected),callback:function ($$v) {_vm.contactSelected=$$v},expression:"contactSelected"}},[_c('v-divider'),_vm._v(" "),_vm._l((_vm.users),function(contact){return [_c('v-list-item',{key:contact._id,attrs:{"value":contact}},[_c('v-list-item-icon',[_c('v-icon',{attrs:{"color":contact.status.online?'green':'red'}},[_vm._v("\n                                        mdi-checkbox-blank-circle\n                                    ")])],1),_vm._v(" "),_c('v-list-item-content',[_c('v-list-item-title',{domProps:{"textContent":_vm._s(contact.profile.name)}})],1)],1)]})],2)],1)],1)],1),_vm._v(" "),_c('v-col',{attrs:{"cols":"12","xs":"12","sm":"8","md":"9","lg":"10","xl":"10"}},[(_vm.contactSelected)?_c('v-card',{staticClass:"mx-auto",attrs:{"height":"70vh"}},[_c('v-list-item',[_c('v-list-item-avatar',{attrs:{"size":"36px"}},[_c('img',{attrs:{"src":_vm.contactSelected.profile.path || 'img/user.png',"alt":"Avatar"}})]),_vm._v(" "),_c('v-list-item-title',{staticClass:"headline"},[_vm._v(_vm._s(_vm.contactSelected.profile.name))])],1),_vm._v(" "),_c('v-card-text',{staticClass:"overflow-y-auto",staticStyle:{"height":"70%"},attrs:{"id":"msgContainer"}},_vm._l((_vm.messages),function(msg){return _c('v-row',{class:msg.idReceiver===_vm.contactSelected._id?'justify-end':'justify-start'},[_c('v-col',{attrs:{"cols":"7"}},[_c('v-card',{attrs:{"raised":"","shaped":"","color":msg.idReceiver===_vm.contactSelected._id?'cyan lighten-5':'red lighten-5'}},[_c('v-card-text',{staticClass:"pb-1"},[_vm._v("\n                                    "+_vm._s(msg.text)+"\n                                ")]),_vm._v(" "),_c('v-card-subtitle',{staticClass:"text-right pt-1 pb-1"},[_c('v-tooltip',{attrs:{"left":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-icon',_vm._g({attrs:{"small":""}},on),[_vm._v("info_outlined")])]}}],null,true)},[_vm._v(" "),_c('span',[_vm._v(_vm._s(msg.date.substring(0, 10)))])]),_vm._v("\n                                    "+_vm._s(msg.date.split('T')[1].substring(0, 5))+"\n                                    "),_c('v-icon',{staticStyle:{"margin-right":"-15px"},attrs:{"small":"","color":msg.read?'red':'gray'}},[_vm._v("\n                                        check\n                                    ")]),_vm._v(" "),_c('v-icon',{attrs:{"small":"","color":msg.read?'red':'gray'}},[_vm._v("\n                                        check\n                                    ")])],1)],1)],1)],1)}),1),_vm._v(" "),_c('v-card-actions',[_c('v-text-field',{attrs:{"autocomplete":"off","label":"Introduce tu mensaje"},on:{"keyup":function($event){if(!$event.type.indexOf('key')&&_vm._k($event.keyCode,"enter",13,$event.key,"Enter")){ return null; }return _vm.sendMessage($event)},"focus":_vm.markMessagesAsRead},model:{value:(_vm.message.text),callback:function ($$v) {_vm.$set(_vm.message, "text", $$v)},expression:"message.text"}}),_vm._v(" "),_c('v-btn',{staticClass:"mx-2",attrs:{"fab":"","dark":"","color":"indigo"},on:{"click":_vm.sendMessage}},[_c('v-icon',{attrs:{"dark":""}},[_vm._v("send")])],1)],1)],1):_c('v-card',{attrs:{"height":"70vh"}},[_c('h1',[_vm._v("Bienvenidos al Chat")])])],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-2dc1bbe5';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'chat';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-2dc1bbe5'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-2dc1bbe5', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Home":{"Home.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Home/Home.vue                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){module.exportDefault({
  name: "Home"
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('h1',[_vm._v("Bienvenido")])};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-43ef6845';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'home';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-43ef6845'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-43ef6845', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Profiles":{"ListProfiles.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Profiles/ListProfiles.vue                                                                      //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
var mapMutations;
module.link("vuex", {
  mapMutations: function (v) {
    mapMutations = v;
  }
}, 0);
var Profile;
module.link("../../../api/Profiles/Profile", {
  Profile: function (v) {
    Profile = v;
  }
}, 1);
var ModalRemove;
module.link("../../components/utilities/Modals/ModalRemove.vue", {
  "default": function (v) {
    ModalRemove = v;
  }
}, 2);
module.exportDefault({
  name: "ListProfiles",
  components: {
    ModalRemove: ModalRemove
  },
  data: function () {
    return {
      headers: [{
        value: 'description',
        text: 'Nombre del perfil',
        sortable: true
      }, {
        value: 'action',
        text: 'Opciones',
        sortable: false
      }],
      profileTemp: {
        preposition: 'el',
        typeElement: 'perfil',
        mainNameElement: '',
        _id: null,
        element: {}
      }
    };
  },
  methods: _objectSpread({}, mapMutations('temporal', ['setElement']), {
    openEditProfile: function (profile) {
      this.setElement(profile);
      this.$router.push({
        name: 'home.profiles.edit'
      });
    },
    openRemoveModal: function (profile) {
      this.profileTemp.element = profile;
      this.profileTemp._id = profile._id;
      this.profileTemp.mainNameElement = profile.description;
      this.$refs.refModalRemove.dialog = true;
    },
    deleteProfile: function (idProfile) {
      var _this = this;

      this.$loader.activate('Eliminando perfil. . .');
      Meteor.call('profile.delete', {
        idProfile: idProfile
      }, function (error, response) {
        _this.$loader.desactivate();

        if (error) {
          if (error.details) {
            _this.$alert.showAlertFull('warning', 'error', error.reason, 'multi-line', 5000, 'rigth', 'bottom', error.details);
          } else {
            _this.$alert.showAlertSimple('error', error.response);
          }
        } else {
          _this.$alert.showAlertSimple('success', response.message);
        }
      });
    }
  }),
  meteor: {
    $subscribe: {
      'profile.listNotStaticProfiles': []
    },
    profiles: function () {
      return Profile.find().fetch();
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',[_c('v-row',{attrs:{"justify":"center"}},[_c('v-col',{attrs:{"xs":"12","sm":"8","md":"6","lg":"5","xl":"5"}},[_c('div',{staticClass:"d-flex flex-row-reverse mb-5"},[_c('v-tooltip',{attrs:{"bottom":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-btn',_vm._g({attrs:{"color":"success","fab":"","dark":"","to":{name: 'home.profiles.create'}}},on),[_c('v-icon',[_vm._v("add")])],1)]}}])},[_vm._v(" "),_c('span',[_vm._v("Agregar perfil")])])],1),_vm._v(" "),_c('v-data-table',{staticClass:"elevation-1",attrs:{"headers":_vm.headers,"items":_vm.profiles,"sort-by":"name"},on:{"dblclick:row":function (ev, ref){
	var item = ref.item;

	return _vm.openEditProfile(item);
}},scopedSlots:_vm._u([{key:"item.action",fn:function(ref){
var item = ref.item;
return [_c('v-tooltip',{attrs:{"bottom":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-icon',_vm._g({directives:[{name:"can",rawName:"v-can:edit.hide",value:('profiles'),expression:"'profiles'",arg:"edit",modifiers:{"hide":true}}],staticClass:"mr-2",attrs:{"color":"info","small":""},on:{"click":function($event){return _vm.openEditProfile(item)}}},on),[_vm._v("\n                                edit\n                            ")])]}}],null,true)},[_vm._v(" "),_c('span',[_vm._v("Editar")])]),_vm._v(" "),_c('v-tooltip',{attrs:{"bottom":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-icon',_vm._g({directives:[{name:"can",rawName:"v-can:delete.hide",value:('profiles'),expression:"'profiles'",arg:"delete",modifiers:{"hide":true}}],staticClass:"mr-2",attrs:{"color":"error","small":""},on:{"click":function($event){return _vm.openRemoveModal(item)}}},on),[_vm._v("\n                                delete\n                            ")])]}}],null,true)},[_vm._v(" "),_c('span',[_vm._v("Eliminar")])])]}}])})],1)],1),_vm._v(" "),_c('modal-remove',{ref:"refModalRemove",attrs:{"modalData":_vm.profileTemp},on:{"id_element":_vm.deleteProfile}})],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-226aa63a';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'list-profiles';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-226aa63a'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-226aa63a', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SaveProfile.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Profiles/SaveProfile.vue                                                                       //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var draggable;
module.link("vuedraggable", {
  "default": function (v) {
    draggable = v;
  }
}, 0);
module.exportDefault({
  name: "SaveProfile",
  components: {
    draggable: draggable
  },
  data: function () {
    return {
      profile: {
        _id: null,
        name: null,
        description: null,
        permissions: []
      },
      dataView: {
        title: '',
        targetButton: ''
      },
      searchSelfPermission: '',
      searchPermission: '',
      selfPermission: [],
      allPermission: []
    };
  },
  created: function () {
    if (this.$router.currentRoute.name.includes("create")) {
      this.dataView.title = "Crear perfil";
      this.dataView.targetButton = "Crear";
      this.listAllPermissions();
    } else if (this.$router.currentRoute.name.includes("edit")) {
      this.dataView.title = "Editar perfil";
      this.dataView.targetButton = "Actualizar";
      this.profile = this.$store.state.temporal.element;
      this.initPermissionsLists();
    }
  },
  methods: {
    onChangeDragList: function (event, propData) {
      if (event.hasOwnProperty('removed')) {
        this[propData] = this[propData].filter(function (permissions) {
          return permissions._id !== event.removed.element._id;
        });
      } else if (event.hasOwnProperty('added')) {
        this[propData].splice(event.added.newIndex, 0, event.added.element);
      }
    },
    saveProfile: function () {
      var _this = this;

      this.$loader.activate('Guardando perfil. . .');
      this.profile.permissions = this.selfPermission.map(function (permission) {
        return permission._id;
      });
      Meteor.call('profile.save', this.profile, function (error, response) {
        _this.$loader.desactivate();

        if (error) {
          _this.$alert.showAlertSimple('error', error.response);
        } else _this.$alert.showAlertSimple('success', response.message);

        _this.$router.push({
          name: 'home.profiles'
        });
      });
    },
    listAllPermissions: function () {
      var _this2 = this;

      Meteor.call('permissions.list', function (error, response) {
        if (error) {
          _this2.$alert.showAlertSimple('error', error.reason);
        } else {
          _this2.allPermission = response.data;
        }
      });
    },
    initPermissionsLists: function () {
      var _this3 = this;

      Meteor.call('permissions.listByIdProfile', {
        idProfile: this.profile._id
      }, function (error, response) {
        if (error) {
          _this3.$alert.showAlertSimple('error', error.reason);
        } else {
          _this3.selfPermission = response.data;
        }
      });
      Meteor.call('permissions.listOtherForIdProfile', {
        idProfile: this.profile._id
      }, function (error, response) {
        if (error) {
          _this3.$alert.showAlertSimple('error', error.reason);
        } else {
          _this3.allPermission = response.data;
        }
      });
    }
  },
  computed: {
    filteredSelfPermissions: function () {
      var _this4 = this;

      return this.selfPermission.filter(function (permissions) {
        return permissions.publicName.toLowerCase().includes(_this4.searchSelfPermission.toLowerCase());
      });
    },
    filteredPermissions: function () {
      var _this5 = this;

      return this.allPermission.filter(function (permissions) {
        return permissions.publicName.toLowerCase().includes(_this5.searchPermission.toLowerCase());
      });
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',[_c('v-row',[_c('v-col',[_c('div',{staticClass:"headline"},[_vm._v(_vm._s(_vm.dataView.title))])]),_vm._v(" "),_c('v-col',{attrs:{"cols":"2"}},[_c('v-btn',{attrs:{"block":"","type":"submit","form":"saveProfile","color":"primary"},domProps:{"textContent":_vm._s(_vm.dataView.targetButton)}})],1)],1),_vm._v(" "),_c('v-row',[_c('v-col',[_c('v-form',{attrs:{"id":"saveProfile","autocomplete":"off"},on:{"submit":function($event){$event.preventDefault();return _vm.saveProfile($event)}}},[_c('v-row',[_c('v-col',{attrs:{"md":"6"}},[_c('v-text-field',{attrs:{"id":"inputName","name":"name","label":"Nombre del perfil"},model:{value:(_vm.profile.name),callback:function ($$v) {_vm.$set(_vm.profile, "name", $$v)},expression:"profile.name"}})],1),_vm._v(" "),_c('v-col',{attrs:{"md":"6"}},[_c('v-text-field',{attrs:{"id":"inputDescription","name":"name","label":"Descripcion del perfil"},model:{value:(_vm.profile.description),callback:function ($$v) {_vm.$set(_vm.profile, "description", $$v)},expression:"profile.description"}})],1)],1)],1)],1)],1),_vm._v(" "),_c('v-row',[_c('v-col',[_c('v-card',[_c('v-card-title',[_vm._v("Permisos de este perfil")]),_vm._v(" "),_c('v-card-text',[_c('v-text-field',{attrs:{"placeholder":"Buscar. . .","id":"inputSearchSelfPermission","name":"profileName"},model:{value:(_vm.searchSelfPermission),callback:function ($$v) {_vm.searchSelfPermission=$$v},expression:"searchSelfPermission"}})],1),_vm._v(" "),_c('v-sheet',{staticClass:"overflow-y-auto",attrs:{"id":"scrolling-techniques-2","max-height":"500"}},[_c('v-list',{staticStyle:{"height":"400px"}},[_c('v-list-item-group',[_c('draggable',{attrs:{"list":_vm.filteredSelfPermissions,"group":"permissions"},on:{"change":function (ev){ return _vm.onChangeDragList(ev,'selfPermission'); }}},_vm._l((_vm.filteredSelfPermissions),function(permissions){return _c('v-list-item',{key:permissions._id,domProps:{"textContent":_vm._s(permissions.publicName)}})}),1)],1)],1)],1)],1)],1),_vm._v(" "),_c('v-col',[_c('v-card',[_c('v-card-title',[_vm._v("Todos los permisos")]),_vm._v(" "),_c('v-card-text',[_c('v-text-field',{attrs:{"placeholder":"Buscar. . .","id":"inputSearchPermission","name":"profileName2"},model:{value:(_vm.searchPermission),callback:function ($$v) {_vm.searchPermission=$$v},expression:"searchPermission"}})],1),_vm._v(" "),_c('v-sheet',{staticClass:"overflow-y-auto",attrs:{"id":"scrolling-techniques-3","max-height":"500"}},[_c('v-list',{staticStyle:{"height":"400px"}},[_c('v-list-item-group',[_c('draggable',{attrs:{"list":_vm.filteredPermissions,"group":"permissions"},on:{"change":function (ev){ return _vm.onChangeDragList(ev,'allPermission'); }}},_vm._l((_vm.filteredPermissions),function(permissions){return _c('v-list-item',{key:permissions._id,domProps:{"textContent":_vm._s(permissions.publicName)}})}),1)],1)],1)],1)],1)],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-31227a01';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'save-profile';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-31227a01'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-31227a01', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Users":{"ListUsers.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Users/ListUsers.vue                                                                            //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
var mapMutations;
module.link("vuex", {
  mapMutations: function (v) {
    mapMutations = v;
  }
}, 0);
var ModalRemove;
module.link("../../components/utilities/Modals/ModalRemove", {
  "default": function (v) {
    ModalRemove = v;
  }
}, 1);
module.exportDefault({
  name: "ListUsers",
  components: {
    ModalRemove: ModalRemove
  },
  data: function () {
    return {
      headersFilter: {
        name: '',
        username: '',
        email: ''
      },
      userTemp: {
        preposition: 'al',
        typeElement: 'usuario',
        mainNameElement: '',
        _id: null,
        element: {}
      }
    };
  },
  computed: {
    headers: function () {
      var _this = this;

      return [{
        value: 'profile.path',
        text: 'Imagen',
        sortable: false
      }, {
        value: 'status.online',
        text: 'En linea',
        sortable: true
      }, {
        value: 'profile.name',
        text: 'Nombre',
        sortable: true,
        filter: function (value) {
          return value != null && typeof value === 'string' && value.toString().toLocaleLowerCase().indexOf(_this.headersFilter.name.toLocaleLowerCase()) !== -1;
        }
      }, {
        value: 'username',
        text: 'Usuario',
        sortable: true,
        filter: function (value) {
          return value != null && typeof value === 'string' && value.toString().toLocaleLowerCase().indexOf(_this.headersFilter.username.toLocaleLowerCase()) !== -1;
        }
      }, {
        value: 'emails[0].address',
        text: 'Correo',
        sortable: true,
        filter: function (value) {
          return value != null && typeof value === 'string' && value.toString().toLocaleLowerCase().indexOf(_this.headersFilter.email.toLocaleLowerCase()) !== -1;
        }
      }, {
        value: 'action',
        text: 'Opciones',
        sortable: false
      }];
    }
  },
  methods: _objectSpread({}, mapMutations('temporal', ['setElement']), {
    // updateMainView() {
    //     const currentRoute = this.$router.currentRoute.name.split('.').pop();
    //     this.activeMainView = (currentRoute === 'users');
    // },
    openEditUser: function (user) {
      this.setElement(user);
      this.$router.push({
        name: 'home.users.edit'
      });
    },
    openRemoveModal: function (user) {
      this.userTemp.element = user;
      this.userTemp._id = user._id;
      this.userTemp.mainNameElement = user.profile.name;
      this.$refs.refModalRemove.dialog = true;
    },
    deleteUser: function (idUser) {
      var _this2 = this;

      this.$loader.activate('Eliminando usuario. . .');
      Meteor.call('user.delete', {
        idUser: idUser
      }, function (error, response) {
        _this2.$loader.desactivate();

        if (error) {
          _this2.$alert.showAlertSimple('error', error.reason);
        } else {
          _this2.$alert.showAlertSimple('succes', response.message);
        }
      });
    }
  }),
  meteor: {
    $subscribe: {
      'user.list': []
    },
    users: function () {
      return Meteor.users.find({
        _id: {
          $ne: Meteor.userId()
        }
      }).fetch();
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',[_c('v-row',{attrs:{"justify":"center"}},[_c('v-col',{attrs:{"xs":"12","sm":"12","md":"10","lg":"8","xl":"5"}},[_c('div',{staticClass:"d-flex flex-row-reverse mb-5"},[_c('v-tooltip',{attrs:{"bottom":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-btn',_vm._g({attrs:{"color":"success","fab":"","dark":"","to":{name: 'home.users.create'}}},on),[_c('v-icon',[_vm._v("add")])],1)]}}])},[_vm._v(" "),_c('span',[_vm._v("Agregar usuario")])])],1),_vm._v(" "),_c('v-data-table',{staticClass:"elevation-1",attrs:{"headers":_vm.headers,"items":_vm.users,"sort-by":"name"},on:{"dblclick:row":function (event,ref){
	var item = ref.item;

	return _vm.openEditUser(item);
}},scopedSlots:_vm._u([{key:"item.profile.path",fn:function(ref){
var item = ref.item;
return [_c('div',{staticClass:"d-flex align-center pt-5 pb-5"},[_c('v-avatar',[_c('img',{attrs:{"src":item.profile.path || '/img/user.png',"alt":"Avatar"}})])],1)]}},{key:"item.status.online",fn:function(ref){
var item = ref.item;
return [_c('div',{staticClass:"d-flex align-center pt-5 pb-5"},[_c('v-icon',{attrs:{"color":item.status.online?'green':'red'}},[_vm._v("\n                            mdi-checkbox-blank-circle\n                        ")])],1)]}},{key:"item.action",fn:function(ref){
var item = ref.item;
return [_c('v-tooltip',{attrs:{"bottom":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-icon',_vm._g({directives:[{name:"can",rawName:"v-can:edit.hide",value:('users'),expression:"'users'",arg:"edit",modifiers:{"hide":true}}],staticClass:"mr-2",attrs:{"color":"info","small":""},on:{"click":function($event){return _vm.openEditUser(item)}}},on),[_vm._v("\n                                edit\n                            ")])]}}],null,true)},[_vm._v(" "),_c('span',[_vm._v("Editar")])]),_vm._v(" "),_c('v-tooltip',{attrs:{"bottom":""},scopedSlots:_vm._u([{key:"activator",fn:function(ref){
var on = ref.on;
return [_c('v-icon',_vm._g({directives:[{name:"can",rawName:"v-can:delete.hide",value:('users'),expression:"'users'",arg:"delete",modifiers:{"hide":true}}],staticClass:"mr-2",attrs:{"color":"error","small":""},on:{"click":function($event){return _vm.openRemoveModal(item)}}},on),[_vm._v("\n                                delete\n                            ")])]}}],null,true)},[_vm._v(" "),_c('span',[_vm._v("Eliminar")])])]}},{key:"body.append",fn:function(ref){
var isMobile = ref.isMobile;
return [(!isMobile)?_c('tr',[_c('td'),_vm._v(" "),_c('td'),_vm._v(" "),_c('td',[_c('v-text-field',{attrs:{"type":"text","label":"Nombre"},model:{value:(_vm.headersFilter.name),callback:function ($$v) {_vm.$set(_vm.headersFilter, "name", $$v)},expression:"headersFilter.name"}})],1),_vm._v(" "),_c('td',[_c('v-text-field',{attrs:{"type":"text","label":"Usuario"},model:{value:(_vm.headersFilter.username),callback:function ($$v) {_vm.$set(_vm.headersFilter, "username", $$v)},expression:"headersFilter.username"}})],1),_vm._v(" "),_c('td',[_c('v-text-field',{attrs:{"type":"email","label":"Correo"},model:{value:(_vm.headersFilter.email),callback:function ($$v) {_vm.$set(_vm.headersFilter, "email", $$v)},expression:"headersFilter.email"}})],1)]):_vm._e()]}}])}),_vm._v(" "),_c('modal-remove',{ref:"refModalRemove",attrs:{"modalData":_vm.userTemp},on:{"id_element":_vm.deleteUser}})],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-73bc0839';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'list-users';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-73bc0839'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-73bc0839', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SaveUser.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/views/Users/SaveUser.vue                                                                             //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var Profile;
module.link("../../../api/Profiles/Profile", {
  Profile: function (v) {
    Profile = v;
  }
}, 0);
var uploadImage;
module.link("../../mixins/users/uploadImage", {
  "default": function (v) {
    uploadImage = v;
  }
}, 1);
module.exportDefault({
  name: "SaveUser",
  mixins: [uploadImage],
  data: function () {
    return {
      user: {
        _id: null,
        username: null,
        emails: [{
          address: null,
          verified: false
        }],
        profile: {
          profile: null,
          name: null,
          path: null
        }
      },
      dataView: {
        title: '',
        targetButton: ''
      }
    };
  },
  created: function () {
    if (this.$router.currentRoute.name.includes("create")) {
      this.dataView.title = "Crear usuario";
      this.dataView.targetButton = "Crear";
    } else if (this.$router.currentRoute.name.includes("edit")) {
      this.dataView.title = "Editar usuario";
      this.dataView.targetButton = "Actualizar";
      var tempUser = this.$store.state.temporal.element;
      this.user = {
        _id: tempUser._id,
        username: tempUser.username,
        emails: tempUser.emails,
        profile: tempUser.profile
      };
    }
  },
  methods: {
    saveUser: function () {
      var _this = this;

      this.$loader.activate('Guardando usuario. . .');
      Meteor.call('user.save', {
        user: this.user,
        photoFileUser: this.photoFileUser
      }, function (error, response) {
        _this.$loader.desactivate();

        if (error) {
          _this.$alert.showAlertSimple('error', error.reason);
        } else {
          _this.$alert.showAlertSimple('success', response.message);

          _this.$router.push({
            name: 'home.users'
          });
        }
      });
    }
  },
  meteor: {
    $subscribe: {
      'profile.listAll': []
    },
    profiles: function () {
      return Profile.find().fetch();
    }
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-container',[_c('v-row',[_c('v-col',[_c('div',{staticClass:"headline"},[_vm._v(_vm._s(_vm.dataView.title))])]),_vm._v(" "),_c('v-col',{attrs:{"cols":"2"}},[_c('v-btn',{attrs:{"block":"","type":"submit","form":"saveUser","color":"primary"},domProps:{"textContent":_vm._s(_vm.dataView.targetButton)}})],1)],1),_vm._v(" "),_c('v-row',[_c('v-col',[_c('v-card',[_c('v-card-text',[_c('v-form',{attrs:{"id":"saveUser","autocomplete":"off"},on:{"submit":function($event){$event.preventDefault();return _vm.saveUser($event)}}},[_c('v-row',[_c('v-col',{attrs:{"xs":"12","sm":"12","md":"4"}},[_c('div',{staticClass:"d-flex flex-column align-center"},[_c('img',{attrs:{"src":_vm.user.profile.path || '/img/user.png',"alt":_vm.user.profile.name,"width":"100px"}}),_vm._v(" "),_c('v-file-input',{directives:[{name:"show",rawName:"v-show",value:(false),expression:"false"}],ref:"imageFile",attrs:{"accept":"image/png, image/jpeg, image/bmp"},model:{value:(_vm.file),callback:function ($$v) {_vm.file=$$v},expression:"file"}}),_vm._v(" "),_c('v-btn',{staticClass:"mb-5 mt-5",attrs:{"color":"primary","width":"100%","rounded":"","depressed":""},on:{"click":_vm.onClickUploadButton}},[(_vm.user.profile.path)?_c('span',[_vm._v("Cambiar")]):_c('span',[_vm._v("Cargar")])])],1)]),_vm._v(" "),_c('v-col',{attrs:{"xs":"12","sm":"12","md":"8"}},[_c('v-text-field',{attrs:{"id":"inputName","name":"name","label":"Nombre"},model:{value:(_vm.user.profile.name),callback:function ($$v) {_vm.$set(_vm.user.profile, "name", $$v)},expression:"user.profile.name"}}),_vm._v(" "),_c('v-select',{attrs:{"id":"selectProfile","name":"profile","items":_vm.profiles,"item-text":"description","item-value":"name","label":"Perfil"},model:{value:(_vm.user.profile.profile),callback:function ($$v) {_vm.$set(_vm.user.profile, "profile", $$v)},expression:"user.profile.profile"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputUserName","name":"username","label":"Usuario"},model:{value:(_vm.user.username),callback:function ($$v) {_vm.$set(_vm.user, "username", $$v)},expression:"user.username"}}),_vm._v(" "),_c('v-text-field',{attrs:{"id":"inputEmail","type":"email","name":"email","label":"Correo"},model:{value:(_vm.user.emails[0].address),callback:function ($$v) {_vm.$set(_vm.user.emails[0], "address", $$v)},expression:"user.emails[0].address"}})],1)],1)],1)],1)],1)],1)],1)],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-9229bfee';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'save-user';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-9229bfee'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-9229bfee', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"directives":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/directives/index.js                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.link("./v-can-directive");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"v-can-directive.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/directives/v-can-directive.js                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var Vue;
module.link("vue", {
  "default": function (v) {
    Vue = v;
  }
}, 0);

function commentNode(el, vnode) {
  var comment = document.createComment(' ');
  Object.defineProperty(comment, 'setAttribute', {
    value: function () {
      return undefined;
    }
  });
  vnode.text = ' ';
  vnode.elm = comment;
  vnode.iscomment = true;
  vnode.context = undefined;
  vnode.tag = undefined;
  vnode.data.directives = undefined;

  if (vnode.componentInstance) {
    vnode.componentInstance.$el = comment;
  }

  if (el.parentNode) {
    el.parentNode.replaceChild(comment, el);
  }
}

Vue.directive('can', function (el, binding, vnode) {
  var behaviour = binding.modifiers.disable ? 'disable' : 'hide';
  var ok = Roles.userIsInRole(Meteor.userId(), binding.value + "-" + binding.arg, Meteor.user().profile.profile);

  if (!ok) {
    if (behaviour === 'hide') {
      commentNode(el, vnode);
    } else if (behaviour === 'disable') {
      el.disabled = true;
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"plugins":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/plugins/index.js                                                                                     //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.link("./vuetify");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"vuetify.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/plugins/vuetify.js                                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var Vue;
module.link("vue", {
  "default": function (v) {
    Vue = v;
  }
}, 0);
var Vuetify;
module.link("vuetify", {
  "default": function (v) {
    Vuetify = v;
  }
}, 1);
module.link("vuetify/dist/vuetify.min.css");
var es;
module.link("vuetify/es5/locale/es", {
  "default": function (v) {
    es = v;
  }
}, 2);
Vue.use(Vuetify);
module.exportDefault(new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: '#01697d',
        socondary: '#002744',
        accent: '#8c191d',
        error: '#d64143',
        info: '#5bc0de',
        success: '#5cb85c',
        warning: '#f0ad4e'
      }
    }
  },
  icons: {
    iconfont: 'md'
  },
  lang: {
    locales: {
      es: es
    },
    current: 'es'
  }
}));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"routes":{"chatRoutes.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/routes/chatRoutes.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var Chat;
module.link("../views/Chat/Chat", {
  "default": function (v) {
    Chat = v;
  }
}, 0);
module.exportDefault({
  name: 'home.chat',
  path: 'chat',
  components: {
    sectionView: Chat
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"loginRoutes.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/routes/loginRoutes.js                                                                                //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var LytAuth;
module.link("../layouts/LytAuth", {
  "default": function (v) {
    LytAuth = v;
  }
}, 0);
var Login;
module.link("../views/Auth/Login", {
  "default": function (v) {
    Login = v;
  }
}, 1);
var ForgotPassword;
module.link("../views/Auth/ForgotPassword", {
  "default": function (v) {
    ForgotPassword = v;
  }
}, 2);
var ResetPassword;
module.link("../views/Auth/ResetPassword", {
  "default": function (v) {
    ResetPassword = v;
  }
}, 3);
var SetInitialPassword;
module.link("../views/Auth/SetInitialPasword", {
  "default": function (v) {
    SetInitialPassword = v;
  }
}, 4);
var VerifyEmail;
module.link("../views/Auth/VerifyEmail.vue", {
  "default": function (v) {
    VerifyEmail = v;
  }
}, 5);
module.exportDefault({
  path: '/login',
  components: {
    allPageView: LytAuth
  },
  children: [{
    name: 'login',
    path: '',
    components: {
      sectionView: Login
    }
  }, {
    name: 'forgotPassword',
    path: '/forgot-password',
    components: {
      sectionView: ForgotPassword
    }
  }, {
    name: 'resetPassword',
    path: '/reset-password/:token',
    components: {
      sectionView: ResetPassword
    }
  }, {
    name: 'enrollAccount',
    path: '/enroll-account/:token',
    components: {
      sectionView: SetInitialPassword
    }
  }, {
    name: 'verifyEmail',
    path: '/verify-email/:token',
    components: {
      sectionView: VerifyEmail
    }
  }]
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"profilesRoutes.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/routes/profilesRoutes.js                                                                             //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var ListProfiles;
module.link("../views/Profiles/ListProfiles", {
  "default": function (v) {
    ListProfiles = v;
  }
}, 0);
var SaveProfile;
module.link("../views/Profiles/SaveProfile", {
  "default": function (v) {
    SaveProfile = v;
  }
}, 1);
module.exportDefault({
  path: 'perfiles',
  components: {
    sectionView: {
      render: function (c) {
        return c("router-view");
      }
    }
  },
  children: [{
    name: 'home.profiles',
    path: '',
    meta: {
      permission: 'profiles-view'
    },
    component: ListProfiles
  }, {
    name: 'home.profiles.create',
    path: 'crear',
    meta: {
      permission: 'profiles-create'
    },
    component: SaveProfile
  }, {
    name: 'home.profiles.edit',
    path: 'editar',
    meta: {
      permission: 'profiles-edit'
    },
    component: SaveProfile
  }]
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"routes.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/routes/routes.js                                                                                     //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var loginRoutes;
module.link("./loginRoutes", {
  "default": function (v) {
    loginRoutes = v;
  }
}, 0);
var LytSPA;
module.link("../layouts/LytSPA", {
  "default": function (v) {
    LytSPA = v;
  }
}, 1);
var Home;
module.link("../views/Home/Home", {
  "default": function (v) {
    Home = v;
  }
}, 2);
var CongfigureAccount;
module.link("../views/Account/ConfigureAccount", {
  "default": function (v) {
    CongfigureAccount = v;
  }
}, 3);
var usersRoutes;
module.link("./usersRoutes", {
  "default": function (v) {
    usersRoutes = v;
  }
}, 4);
var profilesRoutes;
module.link("./profilesRoutes", {
  "default": function (v) {
    profilesRoutes = v;
  }
}, 5);
var chatRoutes;
module.link("./chatRoutes", {
  "default": function (v) {
    chatRoutes = v;
  }
}, 6);
module.exportDefault([{
  path: '*',
  redirect: '/login'
}, loginRoutes, {
  path: '/',
  components: {
    allPageView: LytSPA
  },
  meta: {
    requiresAuth: true
  },
  children: [{
    name: 'home',
    path: '',
    components: {
      sectionView: Home
    }
  }, {
    name: 'home.account',
    path: 'account',
    components: {
      sectionView: CongfigureAccount
    }
  }, usersRoutes, profilesRoutes, chatRoutes]
}]);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"usersRoutes.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/routes/usersRoutes.js                                                                                //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var ListUsers;
module.link("../views/Users/ListUsers", {
  "default": function (v) {
    ListUsers = v;
  }
}, 0);
var SaveUser;
module.link("../views/Users/SaveUser", {
  "default": function (v) {
    SaveUser = v;
  }
}, 1);
module.exportDefault({
  path: 'usuarios',
  components: {
    sectionView: {
      render: function (c) {
        return c("router-view");
      }
    }
  },
  children: [{
    name: 'home.users',
    path: '',
    meta: {
      permission: 'users-view'
    },
    component: ListUsers
  }, {
    name: 'home.users.create',
    path: 'crear',
    meta: {
      permission: 'users-create'
    },
    component: SaveUser
  }, {
    name: 'home.users.edit',
    path: 'editar',
    meta: {
      permission: 'users-edit'
    },
    component: SaveUser
  }]
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"App.vue":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/App.vue                                                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var __vue_script__, __vue_template__; module.exportDefault = function(value) { __vue_script__ = value; }; (function(){var AlertMessage;
module.link("./components/utilities/Alerts/AlertMessage", {
  "default": function (v) {
    AlertMessage = v;
  }
}, 0);
var Loader;
module.link("./components/utilities/Loaders/Loader", {
  "default": function (v) {
    Loader = v;
  }
}, 1);
module.exportDefault({
  name: "App",
  components: {
    AlertMessage: AlertMessage,
    Loader: Loader
  }
});
})();
__vue_script__ = __vue_script__ || {};var __vue_options__ = (typeof __vue_script__ === "function" ?
  (__vue_script__.options || (__vue_script__.options = {}))
  : __vue_script__);__vue_options__.render = function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app',[_c('router-view',{attrs:{"name":"allPageView"}}),_vm._v(" "),_c('alert-message'),_vm._v(" "),_c('loader')],1)};
__vue_options__.staticRenderFns = [];
__vue_options__.render._withStripped = true;
__vue_options__._scopeId = 'data-v-6aa40998';__vue_options__.packageName = 'null';
__vue_options__.name = __vue_options__.name || 'app';module.export('default', exports.default = __vue_script__);exports.__esModule = true;
if(!window.__vue_hot__){
        window.__vue_hot_pending__ = window.__vue_hot_pending__ || {};
        window.__vue_hot_pending__['data-v-6aa40998'] = __vue_script__;
      } else {
        window.__vue_hot__.createRecord('data-v-6aa40998', __vue_script__);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"router.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/router.js                                                                                            //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _this = this;

var Vue;
module.link("vue", {
  "default": function (v) {
    Vue = v;
  }
}, 0);
var VueRouter;
module.link("vue-router", {
  "default": function (v) {
    VueRouter = v;
  }
}, 1);
var store;
module.link("./store", {
  "default": function (v) {
    store = v;
  }
}, 2);
var routes;
module.link("./routes/routes", {
  "default": function (v) {
    routes = v;
  }
}, 3);
Vue.use(VueRouter);
var router = new VueRouter({
  mode: 'history',
  routes: routes
});
router.beforeEach(function (to, from, next) {
  var requiresAuth = to.matched.some(function (record) {
    return record.meta.requiresAuth;
  });
  var isLogged = store.state.auth.isLogged;

  if (!requiresAuth && isLogged && to.name === 'login') {
    next('/');
  } else if (requiresAuth && !isLogged) {
    next('/login');
  } else {
    var permission = to.meta.permission;

    if (permission) {
      Meteor.call('permission.check', {
        permission: permission
      }, function (error, response) {
        if (error) {
          _this.$alert.showAlertSimple('error', error.reason);
        } else if (response.data.hasPermission) {
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
module.exportDefault(router);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"store.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/ui/store.js                                                                                             //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var Vue;
module.link("vue", {
  "default": function (v) {
    Vue = v;
  }
}, 0);
var Vuex;
module.link("vuex", {
  "default": function (v) {
    Vuex = v;
  }
}, 1);
var VuexPersistence;
module.link("vuex-persist", {
  "default": function (v) {
    VuexPersistence = v;
  }
}, 2);
var auth;
module.link("./modules/authentication", {
  "default": function (v) {
    auth = v;
  }
}, 3);
var temporal;
module.link("./modules/temporal", {
  "default": function (v) {
    temporal = v;
  }
}, 4);
Vue.use(Vuex);
var vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  modules: ['auth', 'temporal']
});
module.exportDefault(new Vuex.Store({
  modules: {
    auth: auth,
    temporal: temporal
  },
  plugins: [vuexLocal.plugin]
}));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"api":{"Messages":{"Message.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/Messages/Message.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({
  Message: function () {
    return Message;
  }
});
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 0);
var Message = new Mongo.Collection('messages');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Profiles":{"Profile.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/Profiles/Profile.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({
  Profile: function () {
    return Profile;
  }
});
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 0);
var Profile = new Mongo.Collection('profiles');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"startup":{"both":{"index.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/startup/both/index.js                                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Accounts.config({
  loginExpirationInDays: 30
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"client":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/startup/client/index.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var Vue;
module.link("vue", {
  "default": function (v) {
    Vue = v;
  }
}, 1);
var vuetify;
module.link("../../ui/plugins/vuetify", {
  "default": function (v) {
    vuetify = v;
  }
}, 2);
module.link("../../ui/plugins/index");
var App;
module.link("/imports/ui/App", {
  "default": function (v) {
    App = v;
  }
}, 3);
var router;
module.link("../../ui/router", {
  "default": function (v) {
    router = v;
  }
}, 4);
var store;
module.link("../../ui/store", {
  "default": function (v) {
    store = v;
  }
}, 5);
module.link("../../ui/directives");
Meteor.startup(function () {
  new Vue({
    router: router,
    store: store,
    vuetify: vuetify,
    render: function (h) {
      return h(App);
    }
  }).$mount("app");
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"client":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// client/main.js                                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.link("/imports/startup/client");
module.link("/imports/startup/both");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".ts",
    ".mjs",
    ".vue",
    ".css"
  ]
});

var exports = require("/client/main.js");
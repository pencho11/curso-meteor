var require = meteorInstall({"imports":{"startup":{"server":{"services":{"FirebaseAdmin.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/server/services/FirebaseAdmin.js                                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  firebaseAdminStorage: () => firebaseAdminStorage,
  BASE_URL_STORAGE: () => BASE_URL_STORAGE
});
let firebaseAdmin;
module.link("firebase-admin", {
  default(v) {
    firebaseAdmin = v;
  }

}, 0);
let serviceAccount;
module.link("../../../../settings/meteor-vue-fb643-firebase-adminsdk-50cu3-4c287411da.json", {
  default(v) {
    serviceAccount = v;
  }

}, 1);
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  storageBucket: 'meteor-vue-fb643.appspot.com'
});
const firebaseAdminStorage = firebaseAdmin.storage().bucket();
const BASE_URL_STORAGE = 'https://storage.googleapis.com';
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"MailServ.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/server/services/MailServ.js                                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
if (Meteor.isDevelopment) {
  var _Meteor$settings$priv;

  if ((_Meteor$settings$priv = Meteor.settings.private) !== null && _Meteor$settings$priv !== void 0 && _Meteor$settings$priv.SENDER_EMAILS) {
    process.env.EMAIL_SERVICES = Meteor.settings.private.SENDER_EMAILS.SERVICES;
  } else {
    console.warn('[Meteor + Vue] - Sender emails are not configured, Emails will not be send');
  }
}

const name = 'Scaffold Metor + Vue';
const email = "<".concat(process.env.EMAIL_SERVICES, ">");
const from = "".concat(name, " ").concat(email);
Accounts.emailTemplates.siteName = name;
Accounts.emailTemplates.from = from;
const emailTemplates = Accounts.emailTemplates;
const emailEnrollAccount = 'email_enroll_account.html';
const emailResetPassword = 'email_reset_password.html';
const emailVerifyEmail = 'email_verify_email.html';
const productSrc = 'https://firebasestorage.googleapis.com/v0/b/meteor-vue-fb643.appspot.com/o/vue-meteor.png?alt=media';
const logoSrc = 'https://firebasestorage.googleapis.com/v0/b/meteor-vue-fb643.appspot.com/o/PoweredDark.png?alt=media';
emailTemplates.enrollAccount = {
  subject() {
    return "Bienvenido a ".concat(name);
  },

  html(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    if (Meteor.isDevelopment) console.info('Set initial password link: ', urlWithoutHash);
    SSR.compileTemplate('emailEnrollAccount', Assets.getText(emailEnrollAccount));
    return SSR.render('emailEnrollAccount', {
      urlWithoutHash,
      productSrc,
      logoSrc
    });
  }

};
emailTemplates.resetPassword = {
  subject() {
    return "Restablece tu contrase\xF1a";
  },

  html(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    if (Meteor.isDevelopment) console.info('Password reset link: ', urlWithoutHash);
    SSR.compileTemplate('emailResetPassword', Assets.getText(emailResetPassword));
    return SSR.render('emailResetPassword', {
      urlWithoutHash,
      productSrc,
      logoSrc
    });
  }

};
emailTemplates.verifyEmail = {
  subject() {
    return "Verifica tu correo";
  },

  html(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    if (Meteor.isDevelopment) console.info('Verify email link: ', urlWithoutHash);
    SSR.compileTemplate('emailVerifyEmail', Assets.getText(emailVerifyEmail));
    return SSR.render('emailVerifyEmail', {
      urlWithoutHash,
      productSrc,
      logoSrc
    });
  }

};

if (Meteor.isDevelopment) {
  var _Meteor$settings$priv2;

  if ((_Meteor$settings$priv2 = Meteor.settings.private) !== null && _Meteor$settings$priv2 !== void 0 && _Meteor$settings$priv2.MAIL_URL) {
    process.env.MAIL_URL = Meteor.settings.private.MAIL_URL;
  } else {
    console.warn('[Meteor + Vue] - Email settings are not configured, Emails will not be send');
  }
}

;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"utilities":{"FileOperations.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/server/utilities/FileOperations.js                                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let ResponseMessage;
module.link("./ResponseMessage", {
  ResponseMessage(v) {
    ResponseMessage = v;
  }

}, 0);
let mimetypes;
module.link("mimetypes", {
  default(v) {
    mimetypes = v;
  }

}, 1);
let Utilities;
module.link("./Utilities", {
  default(v) {
    Utilities = v;
  }

}, 2);
let BASE_URL_STORAGE, firebaseAdminStorage;
module.link("../services/FirebaseAdmin", {
  BASE_URL_STORAGE(v) {
    BASE_URL_STORAGE = v;
  },

  firebaseAdminStorage(v) {
    firebaseAdminStorage = v;
  }

}, 3);
module.exportDefault({
  saveFileFromBufferToGoogleStorage(fileBuffer, name, path, mimeType) {
    return Promise.asyncApply(() => {
      const responseMessage = new ResponseMessage();
      const filename = "".concat(name).concat(Utilities.generateNumberToken(10, 99), ".").concat(mimetypes.detectExtension(mimeType));
      const file = firebaseAdminStorage.file("".concat(path, "/").concat(filename));
      const fileUrl = "".concat(BASE_URL_STORAGE, "/").concat(firebaseAdminStorage.name, "/").concat(path, "/").concat(filename);

      try {
        Promise.await(file.save(fileBuffer, {
          metadata: {
            contentType: mimeType
          },
          public: true
        }));
        responseMessage.create('File uploaded', null, {
          success: true,
          fileUrl
        });
      } catch (error) {
        console.error('Error uploading file to Google Storage');
        responseMessage.create('Error uploading file to Google Storage', null, {
          success: false
        });
      }

      return responseMessage;
    });
  },

  saveFileFromBase64ToGoogleStorage(base64file, name, path) {
    return Promise.asyncApply(() => {
      const mimeType = base64file.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
      const base64EncodedImageString = base64file.split(';base64,').pop();
      const fileBuffer = Buffer.from(base64EncodedImageString, 'base64');
      return Promise.await(this.saveFileFromBufferToGoogleStorage(fileBuffer, name, path, mimeType));
    });
  },

  deleteFileFromGoogleStorageIfExists(fileLocation) {
    return Promise.asyncApply(() => {
      const file = firebaseAdminStorage.file(fileLocation);

      try {
        const existsFile = Promise.await(file.exists());

        if (existsFile[0]) {
          Promise.await(file.delete());
        }
      } catch (error) {
        console.error('Error delete file from Google Storage', error);
      }
    });
  },

  deleteFilesOfFolderFromGoogleStorage(userFolder) {
    return Promise.asyncApply(() => {
      try {
        Promise.await(firebaseAdminStorage.deleteFiles({
          prefix: userFolder + '/'
        }));
      } catch (error) {
        console.error('Error deleting files from Google Storage: ', error);
      }
    });
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ResponseMessage.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/server/utilities/ResponseMessage.js                                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  ResponseMessage: () => ResponseMessage
});

class ResponseMessage {
  constructor() {
    this.message = null;
    this.description = null;
    this.data = null;
  }

  create(message) {
    let description = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    this.message = message;
    this.description = description;
    this.data = data;
  }

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Utilities.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/server/utilities/Utilities.js                                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exportDefault({
  generateNumberToken(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Permissions.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/server/Permissions.js                                                                       //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  permissionsArray: () => permissionsArray
});
const Permissions = {
  USERS: {
    LIST: {
      VALUE: 'users-view',
      TEXT: 'Listar usuarios'
    },
    CREATE: {
      VALUE: 'users-create',
      TEXT: 'Crear usuario'
    },
    UPDATE: {
      VALUE: 'users-edit',
      TEXT: 'Actualizar usuario'
    },
    DELETE: {
      VALUE: 'users-delete',
      TEXT: 'Eliminar usuario'
    }
  },
  PROFILES: {
    LIST: {
      VALUE: 'profiles-view',
      TEXT: 'Listar perfiles'
    },
    CREATE: {
      VALUE: 'profiles-create',
      TEXT: 'Crear perfil'
    },
    UPDATE: {
      VALUE: 'profiles-edit',
      TEXT: 'Actualizar perfil'
    },
    DELETE: {
      VALUE: 'profiles-delete',
      TEXT: 'Eliminar perfil'
    }
  },
  PERMISSIONS: {
    LIST: {
      VALUE: 'permissions-view',
      TEXT: 'Listar permisos'
    }
  },
  CHAT: {
    CREATE: {
      VALUE: 'messages-create',
      TEXT: 'Enviar mensajes de chat'
    },
    LIST: {
      VALUE: 'messages-view',
      TEXT: 'Ver mensajes de chat'
    }
  }
};
const permissionsArray = Object.keys(Permissions).reduce((accumulator, systemModuleName) => {
  const systemModuleObject = Permissions[systemModuleName];
  const modulePermissions = Object.keys(systemModuleObject).map(permission => systemModuleObject[permission]);
  return accumulator.concat(modulePermissions);
}, []);

if (Meteor.isDevelopment) {
  if (Meteor.settings.private && Meteor.settings.private.REFRESH_PERMISSIONS) {
    console.log('uplading permissions. . .');
    const currentRoles = Roles.getAllRoles().fetch();

    for (let permission of permissionsArray) {
      if (!currentRoles.find(_role => _role._id === permission.VALUE)) {
        Roles.createRole(permission.VALUE);
      }

      Meteor.roles.update(permission.VALUE, {
        $set: {
          publicName: permission.TEXT
        }
      });
    }
  }
}

module.exportDefault(Permissions);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/server/index.js                                                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.link("./Permissions");
module.link("./services/MailServ");
module.link("./services/FirebaseAdmin");
module.link("../../api/Users/User");
module.link("../../api/Users/UsersCtrl");
module.link("../../api/Users/UsersPubs");
module.link("../../api/Profiles/ProfileSeeder");
module.link("../../api/Profiles/ProfilesCtrl");
module.link("../../api/Profiles/ProfilesPubs");
module.link("../../api/Permissions/PermissionsCtrl");
module.link("../../api/Permissions/PermissionsPubs");
module.link("../../api/SystemOptions/SystemOptionsCtrl");
module.link("../../api/Messages/MessageSeeder");
module.link("../../api/Messages/MessagesCtrl");
module.link("../../api/Messages/MessagesPubs");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"both":{"index.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/startup/both/index.js                                                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
Accounts.config({
  loginExpirationInDays: 30
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"api":{"Messages":{"Message.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Messages/Message.js                                                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  Message: () => Message
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const Message = new Mongo.Collection('messages');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"MessageSeeder.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Messages/MessageSeeder.js                                                                       //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let Message;
module.link("./Message", {
  Message(v) {
    Message = v;
  }

}, 0);
Message.rawCollection().createIndex({
  idSender: 1
});
Message.rawCollection().createIndex({
  idReceiver: 1
});
Message.rawCollection().createIndex({
  date: 1
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"MessagesCtrl.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Messages/MessagesCtrl.js                                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let ValidatedMethod;
module.link("meteor/mdg:validated-method", {
  ValidatedMethod(v) {
    ValidatedMethod = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let AuthGuard;
module.link("../../middlewares/AuthGuard", {
  default(v) {
    AuthGuard = v;
  }

}, 2);
let ResponseMessage;
module.link("../../startup/server/utilities/ResponseMessage", {
  ResponseMessage(v) {
    ResponseMessage = v;
  }

}, 3);
let Message;
module.link("./Message", {
  Message(v) {
    Message = v;
  }

}, 4);
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 5);
new ValidatedMethod({
  name: 'message.save',
  mixins: [MethodHooks],
  beforeHooks: [AuthGuard.checkPermission],
  permissions: [Permissions.CHAT.CREATE.VALUE],

  validate(message) {
    try {
      check(message, {
        idSender: String,
        idReceiver: String,
        text: String,
        date: String,
        read: Boolean
      });
    } catch (error) {
      console.error('message.save', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }
  },

  run(message) {
    const responseMessage = new ResponseMessage();

    try {
      Message.insert(message);
      responseMessage.create('Se inserto el mensaje exitosamente');
    } catch (error) {
      console.error('message.save', error);
      throw new Meteor.Error('500', 'Ha ocurrido un error al insertar el mensaje');
    }

    return responseMessage;
  }

});
new ValidatedMethod({
  name: 'messages.read',
  mixins: [MethodHooks],
  beforeHooks: [AuthGuard.isUserLogged],

  validate(messages) {
    try {
      check(messages, [{
        _id: String,
        idSender: String,
        idReceiver: String,
        text: String,
        date: String,
        read: Boolean
      }]);
    } catch (error) {
      console.error('messages.read', error);
      throw new Meteor.Error('403', 'La informacion no es valida');
    }
  },

  run(messages) {
    const responseMessage = new ResponseMessage();

    try {
      Message.update({
        _id: {
          $in: messages.map(m => m._id)
        }
      }, {
        $set: {
          read: true
        }
      }, {
        multi: true
      });
    } catch (error) {
      console.error('messages.read', error);
      throw new Meteor.Error('500', 'Ha ocurrido un error al marcar los mensajes como leidos.');
    }

    return responseMessage;
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"MessagesPubs.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Messages/MessagesPubs.js                                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let PermissionMiddleware;
module.link("../../middlewares/PermissionsMiddleware", {
  PermissionMiddleware(v) {
    PermissionMiddleware = v;
  }

}, 0);
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 1);
let Message;
module.link("./Message", {
  Message(v) {
    Message = v;
  }

}, 2);
const messagesPublication = new PublishEndpoint('messages.list', function () {
  let idContact = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  const idUserLogged = this.userId;
  return Message.find({
    $or: [{
      idSender: idUserLogged,
      idReceiver: idContact
    }, {
      idSender: idContact,
      idReceiver: idUserLogged
    }]
  }, {
    limit: 20,
    sort: {
      date: -1
    }
  });
});
messagesPublication.use(new PermissionMiddleware([Permissions.CHAT.LIST.VALUE]));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Permissions":{"PermissionsCtrl.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Permissions/PermissionsCtrl.js                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 0);
let ResponseMessage;
module.link("../../startup/server/utilities/ResponseMessage", {
  ResponseMessage(v) {
    ResponseMessage = v;
  }

}, 1);
let AuthGuard;
module.link("../../middlewares/AuthGuard", {
  default(v) {
    AuthGuard = v;
  }

}, 2);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 3);
let Profile;
module.link("../Profiles/Profile", {
  Profile(v) {
    Profile = v;
  }

}, 4);
new ValidatedMethod({
  name: 'permissions.list',
  mixins: [MethodHooks],
  permissions: [Permissions.PERMISSIONS.LIST.VALUE],
  beforeHooks: [AuthGuard.checkPermission],
  validate: null,

  run() {
    const responseMessage = new ResponseMessage();

    try {
      const permissions = Meteor.roles.find().fetch();
      responseMessage.create('Permisos disponibles del sistema', null, permissions);
    } catch (error) {
      console.error('permissions.list: ', error);
      throw new Meteor.Error('500', 'Ocurrio un error al obtener los permisos');
    }

    return responseMessage;
  }

});
new ValidatedMethod({
  name: 'permissions.listByIdProfile',
  mixins: [MethodHooks],
  permissions: [Permissions.PERMISSIONS.LIST.VALUE],
  beforeHooks: [AuthGuard.checkPermission],

  validate(_ref) {
    let {
      idProfile
    } = _ref;

    try {
      check(idProfile, String);
    } catch (error) {
      console.error('permissions.listByIdProfile: ', error);
      throw new Meteor.Error('403', 'La informacion introducida es valida');
    }
  },

  run(_ref2) {
    let {
      idProfile
    } = _ref2;
    const responseMessage = new ResponseMessage();

    try {
      const profile = Profile.findOne(idProfile);
      const permissions = Meteor.roles.find({
        _id: {
          $nin: profile.permissions
        }
      }).fetch();
      responseMessage.create('Permisos asociados al perfil.', null, permissions);
    } catch (error) {
      console.error('permissions.listByIdProfile: ', error);
      throw new Meteor.Error('500', 'Ocurrio un error al obtener los permisos del perfil');
    }

    return responseMessage;
  }

});
new ValidatedMethod({
  name: 'permissions.listOtherForIdProfile',
  mixins: [MethodHooks],
  permissions: [Permissions.PERMISSIONS.LIST.VALUE],
  beforeHooks: [AuthGuard.checkPermission],

  validate(_ref3) {
    let {
      idProfile
    } = _ref3;

    try {
      check(idProfile, String);
    } catch (error) {
      console.error('permissions.listOtherForIdProfile: ', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }
  },

  run(_ref4) {
    let {
      idProfile
    } = _ref4;
    const responseMessage = new ResponseMessage();

    try {
      const profile = Profile.findOne(idProfile);
      const permissions = Meteor.roles.find({
        _id: {
          $not: {
            $nin: profile.permissions
          }
        }
      }).fetch();
      responseMessage.create('Permisos no asociados al perfil.', null, permissions);
    } catch (error) {
      console.error('permissions.listOtherForIdProfile: ', error);
      throw new Meteor.Error('500', 'Ocurrio un error al obtener los permisos no asociados al perfil');
    }

    return responseMessage;
  }

});
new ValidatedMethod({
  name: 'permission.check',
  mixins: [MethodHooks],
  beforeHooks: [AuthGuard.isUserLogged],

  validate(_ref5) {
    let {
      permission
    } = _ref5;

    try {
      check(permission, String);
    } catch (error) {
      console.error('permissions.listOtherForIdProfile: ', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }
  },

  run(_ref6) {
    let {
      permission
    } = _ref6;
    const responseMessage = new ResponseMessage();

    try {
      const scope = Roles.getScopesForUser(this.userId)[0];
      const hasPermission = Roles.userIsInRole(this.userId, permission, scope);
      responseMessage.create("El usuario ".concat(hasPermission ? 'si' : 'no', " tiene el permiso"), null, {
        hasPermission
      });
    } catch (error) {
      console.error('permissions.check: ', error);
      throw new Meteor.Error('500', 'Ocurrio un error al verificar el permiso');
    }

    return responseMessage;
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"PermissionsPubs.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Permissions/PermissionsPubs.js                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
Meteor.publish('roles', function () {
  return Meteor.roleAssignment.find({
    'user._id': this.userId
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Profiles":{"Profile.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Profiles/Profile.js                                                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  Profile: () => Profile
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const Profile = new Mongo.Collection('profiles');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ProfileSeeder.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Profiles/ProfileSeeder.js                                                                       //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  StaticProfiles: () => StaticProfiles
});
let Permissions, permissionsArray;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  },

  permissionsArray(v) {
    permissionsArray = v;
  }

}, 0);
let Profile;
module.link("./Profile", {
  Profile(v) {
    Profile = v;
  }

}, 1);
Profile.rawCollection().createIndex({
  'name': 1
}, {
  unique: true
});
const StaticProfiles = {
  admin: {
    name: 'admin',
    description: 'Administrador',
    permissions: permissionsArray.map(p => p.VALUE)
  }
};

if (Meteor.isDevelopment) {
  if (Meteor.settings.private && Meteor.settings.private.REFRESH_STATIC_PROFILES) {
    console.log('updating static profiles. . .');
    Object.keys(StaticProfiles).forEach(staticProfileName => {
      Profile.upsert({
        name: StaticProfiles[staticProfileName].name
      }, {
        $set: {
          description: StaticProfiles[staticProfileName].description,
          permissions: StaticProfiles[staticProfileName].permissions
        }
      });
      Meteor.users.find({
        'profile.profile': StaticProfiles[staticProfileName].name
      }).fetch().forEach(user => {
        Meteor.roleAssignment.remove({
          'user._id': user._id
        });

        if (StaticProfiles[staticProfileName].permissions.length > 0) {
          Roles.setUserRoles(user._id, StaticProfiles[staticProfileName].permissions, StaticProfiles[staticProfileName].name);
        }
      });
    });
  }
}

;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ProfilesCtrl.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Profiles/ProfilesCtrl.js                                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let check, Match;
module.link("meteor/check", {
  check(v) {
    check = v;
  },

  Match(v) {
    Match = v;
  }

}, 0);
let AuthGuard;
module.link("../../middlewares/AuthGuard", {
  default(v) {
    AuthGuard = v;
  }

}, 1);
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 2);
let ResponseMessage;
module.link("../../startup/server/utilities/ResponseMessage", {
  ResponseMessage(v) {
    ResponseMessage = v;
  }

}, 3);
let Profile;
module.link("./Profile", {
  Profile(v) {
    Profile = v;
  }

}, 4);
let ProfilesServ;
module.link("./ProfilesServ", {
  default(v) {
    ProfilesServ = v;
  }

}, 5);
new ValidatedMethod({
  name: 'profile.save',
  mixins: [MethodHooks],
  permissions: [Permissions.PROFILES.CREATE.VALUE, Permissions.PROFILES.UPDATE.VALUE],
  beforeHooks: [AuthGuard.checkPermission],

  validate(profile) {
    try {
      check(profile, {
        _id: Match.OneOf(String, null),
        name: String,
        description: String,
        permissions: [String]
      });
    } catch (error) {
      console.error('profile.save', error);
      throw new Meteor.Error('403', 'La informacion no es valida');
    }

    ProfilesServ.validateName(profile.name, profile._id);
  },

  run(profile) {
    const responseMessage = new ResponseMessage();

    if (profile._id !== null) {
      try {
        // UPDATE PROFILE
        const oldProfile = Profile.findOne(profile._id);
        const users = ProfilesServ.getUsersByProfile(profile._id);
        Profile.update(profile._id, {
          $set: {
            name: profile.name,
            description: profile.description,
            permissions: profile.permissions
          }
        });

        if (oldProfile.name !== profile.name) {
          Meteor.users.update({
            'profile.profile': oldProfile.name
          }, {
            $set: {
              'profile.profile': profile.name
            }
          }, {
            multi: true
          });
        }

        ProfilesServ.updateProfileUsers(users, profile);
        responseMessage.create('Se actualizo el perfil exitosamente');
      } catch (error) {
        console.error('profile.save', error);
        throw new Meteor.Error('500', 'Ocurrio un error al actualizar el perfil');
      }
    } else {
      try {
        // CREATE PROFILE
        Profile.insert({
          name: profile.name,
          description: profile.description,
          permissions: profile.permissions
        });
        responseMessage.create('Se creo el perfil exitosamente');
      } catch (error) {
        console.error('profile.save', error);
        throw new Meteor.Error('500', 'Ocurrio un error al crear el nuevo perfil');
      }
    }

    return responseMessage;
  }

});
new ValidatedMethod({
  name: 'profile.delete',
  mixins: [MethodHooks],
  permissions: [Permissions.PROFILES.DELETE.VALUE],
  beforeHooks: [AuthGuard.checkPermission],

  validate(_ref) {
    let {
      idProfile
    } = _ref;

    try {
      check(idProfile, String);
    } catch (error) {
      console.error('profile.delete', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }

    const users = ProfilesServ.getUsersByProfile(idProfile);

    if (users.length > 0) {
      throw new Meteor.Error('403', 'No se puede eliminar perfil.', 'Hay usuarios usando este perfil');
    }
  },

  run(_ref2) {
    let {
      idProfile
    } = _ref2;
    const responseMessage = new ResponseMessage();

    try {
      Profile.remove(idProfile);
      responseMessage.create('Perfil eliminado exitosamente');
    } catch (error) {
      console.error('profile.delete', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }

    return responseMessage;
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ProfilesPubs.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Profiles/ProfilesPubs.js                                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let PermissionMiddleware;
module.link("../../middlewares/PermissionsMiddleware", {
  PermissionMiddleware(v) {
    PermissionMiddleware = v;
  }

}, 0);
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 1);
let Profile;
module.link("./Profile", {
  Profile(v) {
    Profile = v;
  }

}, 2);
let ProfilesServ;
module.link("./ProfilesServ", {
  default(v) {
    ProfilesServ = v;
  }

}, 3);
const noStaticProfilesPublication = new PublishEndpoint('profile.listNotStaticProfiles', function () {
  return Profile.find({
    name: {
      $nin: ProfilesServ.getStaticProfileName()
    }
  });
});
const profilesPublication = new PublishEndpoint('profile.listAll', function () {
  return Profile.find();
});
profilesPublication.use(new PermissionMiddleware([Permissions.PROFILES.LIST.VALUE]));
noStaticProfilesPublication.use(new PermissionMiddleware([Permissions.PROFILES.LIST.VALUE]));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ProfilesServ.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Profiles/ProfilesServ.js                                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let Profile;
module.link("./Profile", {
  Profile(v) {
    Profile = v;
  }

}, 0);
let StaticProfiles;
module.link("./ProfileSeeder", {
  StaticProfiles(v) {
    StaticProfiles = v;
  }

}, 1);
module.exportDefault({
  validateName(name, idProfile) {
    const existName = Profile.findOne({
      name
    });

    if (idProfile) {
      const oldProfile = Profile.findOne(idProfile);

      if (oldProfile.name !== name && existName) {
        throw new Meteor.Error('403', "El nuevo nombre de perfil ya se encuentra en uso");
      }
    } else if (existName) {
      throw new Meteor.Error('403', "El nombre de perfil ya se encuentra en uso");
    }
  },

  getUsersByProfile(idProfile) {
    const profile = Profile.findOne(idProfile);
    return Meteor.users.find({
      'profile.profile': profile.name
    }).fetch();
  },

  setUserRoles(idUser, profileName) {
    const permissions = Profile.findOne({
      name: profileName
    }).permissions;
    Meteor.roleAssignment.remove({
      'user._id': idUser
    });
    Roles.setUserRoles(idUser, permissions, profileName);
  },

  updateProfileUsers(users, profile) {
    users.forEach(user => {
      this.setUserRoles(user._id, profile.name);
    });
  },

  getStaticProfileName() {
    return Object.keys(StaticProfiles).map(staticProfileName => {
      return StaticProfiles[staticProfileName].name;
    });
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"SystemOptions":{"SystemOptions.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/SystemOptions/SystemOptions.js                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 0);
module.exportDefault([{
  title: 'Inicio',
  permission: null,
  routeName: 'home'
}, {
  title: 'Usuarios',
  permission: Permissions.USERS.LIST.VALUE,
  routeName: 'home.users'
}, {
  title: 'Perfiles',
  permission: Permissions.PROFILES.LIST.VALUE,
  routeName: 'home.profiles'
}, {
  title: 'Chat',
  permission: Permissions.CHAT.LIST.VALUE,
  routeName: 'home.chat'
}]);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SystemOptionsCtrl.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/SystemOptions/SystemOptionsCtrl.js                                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let SystemOptions;
module.link("./SystemOptions", {
  default(v) {
    SystemOptions = v;
  }

}, 0);
let ResponseMessage;
module.link("../../startup/server/utilities/ResponseMessage", {
  ResponseMessage(v) {
    ResponseMessage = v;
  }

}, 1);
let AuthGuard;
module.link("../../middlewares/AuthGuard", {
  default(v) {
    AuthGuard = v;
  }

}, 2);
new ValidatedMethod({
  name: 'user.getSystemOptions',
  mixins: [MethodHooks],
  beforeHooks: [AuthGuard.isUserLogged],
  validate: null,

  run() {
    const responseMessage = new ResponseMessage();
    const userLogged = Meteor.user();
    const userRoles = Roles.getRolesForUser(userLogged._id, userLogged.profile.profile);
    const optionsOfUser = SystemOptions.reduce((accumulator, systemOption) => {
      if (!systemOption.permission || !!userRoles.find(role => role === systemOption.permission)) {
        accumulator.push(systemOption);
      }

      return accumulator;
    }, []);
    responseMessage.create('Opciones del sistema de usuario.', null, optionsOfUser);
    return responseMessage;
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"Users":{"User.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Users/User.js                                                                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let User;
module.link("meteor/socialize:user-model", {
  User(v) {
    User = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
Meteor.users.rawCollection().createIndex({
  'profile.profile': 1
});
const UserProfileSchema = new SimpleSchema({
  profile: {
    type: Object,
    optional: false,
    blackbox: true
  }
});
User.attachSchema(UserProfileSchema);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"UserPresenceConfig.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Users/UserPresenceConfig.js                                                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let User;
module.link("meteor/socialize:user-model", {
  User(v) {
    User = v;
  }

}, 1);
let UserPresence;
module.link("meteor/socialize:user-presence", {
  UserPresence(v) {
    UserPresence = v;
  }

}, 2);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 3);
// Schema for the fields where we will store the status data
const StatusSchema = new SimpleSchema({
  status: Object,
  'status.online': {
    type: Boolean
  },
  'status.idle': {
    type: Boolean,
    optional: true
  },
  'status.lastLogin': {
    type: Object,
    optional: true,
    blackbox: true
  }
}); // Add the schema to the existing schema currently attached to the User model

User.attachSchema(StatusSchema); // If `sessionIds` is undefined this signifies we need a fresh start.
// When a full cleanup is necessary we will unset the status field to show all users as offline

UserPresence.onCleanup(function onCleanup(sessionIds) {
  if (!sessionIds) {
    Meteor.users.update({}, {
      $set: {
        'status.online': false
      },
      $unset: {
        'status.idle': true
      }
    }, {
      multi: true
    });
  }
}); // When a user comes online we set their status to online and set the lastOnline field to the current time

UserPresence.onUserOnline(function onUserOnline(userId, connection) {
  if (connection) {
    Meteor.users.update(userId, {
      $set: {
        'status.online': true,
        'status.idle': false,
        'status.lastLogin': {
          date: new Date(),
          ipAddr: connection.clientAddress,
          userAgent: connection.httpHeaders['user-agent']
        }
      }
    });
  }
}); // When a user goes idle we'll set their status to indicate this

UserPresence.onUserIdle(function onUserIdle(userId) {
  Meteor.users.update(userId, {
    $set: {
      'status.idle': true
    }
  });
}); // When a user goes offline we'll unset their status field to indicate offline status

UserPresence.onUserOffline(function onUserOffline(userId) {
  Meteor.users.update(userId, {
    $set: {
      'status.online': false
    },
    $unset: {
      'status.idle': true
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"UsersCtrl.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Users/UsersCtrl.js                                                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let ValidatedMethod;
module.link("meteor/mdg:validated-method", {
  ValidatedMethod(v) {
    ValidatedMethod = v;
  }

}, 0);
let check, Match;
module.link("meteor/check", {
  check(v) {
    check = v;
  },

  Match(v) {
    Match = v;
  }

}, 1);
let ResponseMessage;
module.link("../../startup/server/utilities/ResponseMessage", {
  ResponseMessage(v) {
    ResponseMessage = v;
  }

}, 2);
let UsersServ;
module.link("./UsersServ", {
  default(v) {
    UsersServ = v;
  }

}, 3);
let AuthGuard;
module.link("../../middlewares/AuthGuard", {
  default(v) {
    AuthGuard = v;
  }

}, 4);
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 5);
module.link("./UserPresenceConfig");
Accounts.onCreateUser((options, user) => {
  const customizedUser = Object.assign({
    status: {
      online: false
    }
  }, user);

  if (options.profile) {
    customizedUser.profile = options.profile;
  }

  return customizedUser;
});
Accounts.validateLoginAttempt(loginAttempt => {
  if (loginAttempt.allowed) {
    var _loginAttempt$user$se;

    if (!loginAttempt.user.emails[0].verified) {
      throw new Meteor.Error('403', 'El correo de la cuenta no se ha verificado aun.');
    }

    const loginTokensOfUser = ((_loginAttempt$user$se = loginAttempt.user.services.resume) === null || _loginAttempt$user$se === void 0 ? void 0 : _loginAttempt$user$se.loginTokens) || [];

    if (loginTokensOfUser.length > 1) {
      Meteor.users.update(loginAttempt.user._id, {
        $set: {
          'services.resume.loginTokens': [loginTokensOfUser.pop()]
        }
      });
    }

    return true;
  }
});
new ValidatedMethod({
  name: 'user.save',
  mixins: [MethodHooks],
  permissions: [Permissions.USERS.CREATE.VALUE, Permissions.USERS.UPDATE.VALUE],
  beforeHooks: [AuthGuard.checkPermission],

  validate(_ref) {
    let {
      user
    } = _ref;

    try {
      check(user, {
        _id: Match.OneOf(String, null),
        username: String,
        emails: [{
          address: String,
          verified: Boolean
        }],
        profile: {
          profile: String,
          name: String,
          path: Match.OneOf(String, null)
        }
      });
    } catch (error) {
      console.log('save.user', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }

    UsersServ.validateEmail(user.emails[0].address, user._id);
    UsersServ.validateUsername(user.username, user._id);
  },

  run(_ref2) {
    return Promise.asyncApply(() => {
      let {
        user,
        photoFileUser
      } = _ref2;
      const responseMessage = new ResponseMessage();

      if (user._id !== null) {
        try {
          // UPDATE USER 
          Promise.await(UsersServ.updateUser(user, photoFileUser));
          responseMessage.create('Se actualizo el usuario exitosamente');
        } catch (error) {
          console.error('user.save', error);
          throw new Meteor.Error('500', 'Ocurrio un error al actualizar el usuario');
        }
      } else {
        try {
          // CREATE USER
          Promise.await(UsersServ.createUser(user, photoFileUser));
          responseMessage.create('Se ha creado usuario exitosamente');
        } catch (error) {
          console.error('user.save: ', error);
          throw new Meteor.Error('500', 'Ocurrió un error al crear un usuario');
        }
      }

      return responseMessage;
    });
  }

});
new ValidatedMethod({
  name: 'user.delete',
  mixins: [MethodHooks],
  permissions: [Permissions.USERS.DELETE.VALUE],
  beforeHooks: [AuthGuard.checkPermission],

  validate(_ref3) {
    let {
      idUser
    } = _ref3;

    try {
      check(idUser, String);
    } catch (error) {
      console.error('user.delete', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }
  },

  run(_ref4) {
    return Promise.asyncApply(() => {
      let {
        idUser
      } = _ref4;
      const responseMessage = new ResponseMessage();

      try {
        Promise.await(UsersServ.deleteUser(idUser));
        responseMessage.create('Se ha eliminado exitosamente al usuario');
      } catch (error) {
        console.error('user.delete', error);
        throw new Meteor.Error('500', 'Ocurrio un error al eliminar un usuario');
      }

      return responseMessage;
    });
  }

});
new ValidatedMethod({
  name: 'user.updatePersonalData',
  mixins: [MethodHooks],
  beforeHooks: [AuthGuard.isUserLogged],

  validate(_ref5) {
    let {
      user
    } = _ref5;

    try {
      check(user, {
        _id: Match.OneOf(String, null),
        username: String,
        emails: [{
          address: String,
          verified: Boolean
        }],
        profile: {
          profile: String,
          name: String,
          path: Match.OneOf(String, null)
        }
      });
    } catch (error) {
      console.log('user.updatePersonalData', error);
      throw new Meteor.Error('403', 'La informacion introducida no es valida');
    }

    UsersServ.validateEmail(user.emails[0].address, user._id);
    UsersServ.validateUsername(user.username, user._id);
  },

  run(_ref6) {
    return Promise.asyncApply(() => {
      let {
        user,
        photoFileUser
      } = _ref6;
      const responseMessage = new ResponseMessage();

      try {
        // UPDATE USER 
        Promise.await(UsersServ.updateUser(user, photoFileUser));
        responseMessage.create('Se actualizo la informacion exitosamente');
      } catch (error) {
        console.error('user.updatePersonalData', error);
        throw new Meteor.Error('500', 'Ocurrio un error al actualizar la informacion');
      }

      return responseMessage;
    });
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"UsersPubs.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Users/UsersPubs.js                                                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let PublishEndpoint;
module.link("meteor/peerlibrary:middleware", {
  PublishEndpoint(v) {
    PublishEndpoint = v;
  }

}, 1);
let PermissionMiddleware;
module.link("../../middlewares/PermissionsMiddleware", {
  PermissionMiddleware(v) {
    PermissionMiddleware = v;
  }

}, 2);
let Permissions;
module.link("../../startup/server/Permissions", {
  default(v) {
    Permissions = v;
  }

}, 3);
const usersPublication = new PublishEndpoint('user.list', function () {
  return Meteor.users.find({}, {
    sort: {
      createdAt: -1
    }
  });
});
usersPublication.use(new PermissionMiddleware([Permissions.USERS.LIST.VALUE]));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"UsersServ.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/Users/UsersServ.js                                                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let FileOperations;
module.link("../../startup/server/utilities/FileOperations", {
  default(v) {
    FileOperations = v;
  }

}, 0);
let ProfilesServ;
module.link("../Profiles/ProfilesServ", {
  default(v) {
    ProfilesServ = v;
  }

}, 1);
const PATH_USER_FILES = 'users/';
module.exportDefault({
  validateEmail(newEmail, idUser) {
    const existEmail = Accounts.findUserByEmail(newEmail);

    if (idUser) {
      const oldUser = Meteor.users.findOne(idUser);

      if (oldUser.emails[0].address !== newEmail && existEmail) {
        throw new Meteor.Error('403', 'El nuevo email ya se encuentra en uso');
      }
    } else if (existEmail) {
      throw new Meteor.Error('403', 'El nuevo email ya se encuetra en uso');
    }
  },

  validateUsername(newUsername, idUser) {
    const existUsername = Accounts.findUserByUsername(newUsername);

    if (idUser) {
      const oldUser = Meteor.users.findOne(idUser);

      if (oldUser.username !== newUsername && existUsername) {
        throw new Meteor.Error('403', "El nuevo nombre de usuario ya se encuentra en uso");
      }
    } else if (existUsername) {
      throw new Meteor.Error('403', "El nombre de usuario ya se encuentra en uso");
    }
  },

  createUser(user, photoFileUser) {
    return Promise.asyncApply(() => {
      const idUser = Accounts.createUser({
        username: user.username,
        email: user.emails[0].address,
        profile: user.profile
      });
      let avatarSrc = null;

      if (idUser) {
        ProfilesServ.setUserRoles(idUser, user.profile.profile);
        Accounts.sendEnrollmentEmail(idUser, user.emails[0].address);
      }

      if (photoFileUser) {
        const response = Promise.await(FileOperations.saveFileFromBase64ToGoogleStorage(photoFileUser, 'avatar', PATH_USER_FILES + idUser));

        if (!response.data.success) {
          throw new Meteor.Error('500', 'Error al subir la foto');
        } else {
          avatarSrc = response.data.fileUrl;
        }
      }

      Meteor.users.update(idUser, {
        $set: {
          'profile.path': avatarSrc
        }
      });
    });
  },

  updateUser(user, photoFileUser) {
    return Promise.asyncApply(() => {
      const currentUser = Meteor.users.findOne(user._id);

      if (currentUser.emails[0].address !== user.emails[0].address) {
        Accounts.removeEmail(currentUser._id, currentUser.emails[0].address);
        Accounts.addEmail(currentUser._id, user.emails[0].address);
        Accounts.sendVerificationEmail(user._id, user.emails[0].address);
      }

      if (currentUser.username !== user.username) {
        Accounts.setUsername(currentUser._id, user.username);
      }

      Meteor.users.update(user._id, {
        $set: {
          profile: {
            profile: user.profile.profile,
            name: user.profile.name,
            path: currentUser.profile.path
          }
        }
      });
      ProfilesServ.setUserRoles(user._id, user.profile.profile);

      if (photoFileUser) {
        if (currentUser.profile.path) {
          Promise.await(FileOperations.deleteFileFromGoogleStorageIfExists(currentUser.profile.path.substring(currentUser.profile.path.indexOf(PATH_USER_FILES))));
        }

        const response = Promise.await(FileOperations.saveFileFromBase64ToGoogleStorage(photoFileUser, 'avatar', PATH_USER_FILES + user._id));

        if (!response.data.success) {
          throw new Meteor.Error('403', 'Error al subir la foto.');
        } else {
          Meteor.users.update(user._id, {
            $set: {
              'profile.path': response.data.fileUrl
            }
          });
        }
      }
    });
  },

  deleteUser(idUser) {
    return Promise.asyncApply(() => {
      Meteor.users.remove(idUser);
      Meteor.roleAssignment.remove({
        'user._id': idUser
      });
      Promise.await(FileOperations.deleteFilesOfFolderFromGoogleStorage(PATH_USER_FILES + idUser));
    });
  }

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"middlewares":{"AuthGuard.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/middlewares/AuthGuard.js                                                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
const checkPermission = function (methodArgs, methodOptions) {
  const idUser = this.userId;
  const permissions = methodOptions.permissions;
  let hasPermission = false;

  if (idUser !== null) {
    const profileName = Meteor.user().profile.profile;
    hasPermission = Roles.userIsInRole(idUser, permissions, profileName);
  }

  if (!hasPermission) {
    throw new Meteor.Error('403', 'Acceso denegado', 'No tienes permiso para ejecutar esta accion');
  }

  return methodArgs;
};

const isUserLogged = function (methodArgs, methodOptions) {
  if (!this.userId) {
    throw new Meteor.Error('403', 'Acceso denegado', 'No tienes permiso para ejecutar esta accion');
  }

  return methodArgs;
};

module.exportDefault({
  checkPermission,
  isUserLogged
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"PermissionsMiddleware.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/middlewares/PermissionsMiddleware.js                                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({
  PermissionMiddleware: () => PermissionMiddleware
});

class PermissionMiddleware extends PublishMiddleware {
  constructor(permissions) {
    super();
    this._permissions = permissions;
  }

  added(publish, collection, id, fields) {
    if (publish.userId) {
      return super.added(...arguments);
    }

    return publish.ready();
  }

  change(publish, collection, id, fields) {
    if (this.checkPermission(publish.userId)) {
      return super.changed(...arguments);
    }

    return publish.ready();
  }

  removed(publish, collection, id) {
    if (this.checkPermission(publish.userId)) {
      return super.removed(...arguments);
    }

    return publish.ready();
  }

  onReady(publish) {
    if (publish.userId) {
      return super.onReady(...arguments);
    }
  }

  onStop(publish) {
    if (publish.userId) {
      return super.onStop(...arguments);
    }
  }

  onError(publish) {
    if (publish.userId) {
      return super.onError(...arguments);
    }
  }

  checkPermission(idUser) {
    const profileName = Roles.getScopesForUser(idUser)[0];
    return Roles.userIsInRole(idUser, this._permissions, profileName);
  }

}

;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// server/main.js                                                                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.link("/imports/startup/server");
module.link("/imports/startup/both");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"settings":{"meteor-vue-fb643-firebase-adminsdk-50cu3-4c287411da.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// settings/meteor-vue-fb643-firebase-adminsdk-50cu3-4c287411da.json                                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "type": "service_account",
  "project_id": "meteor-vue-fb643",
  "private_key_id": "4c287411dad90a48a241628463b1be3ae291fc75",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2PqG7w4cQD6a1\nPEAJfZOO/V83SpAifGcvVQznUrh+KfNg29X4EFQ8lpETl24CCzvJZfUqXqymp3wI\n5+UaTPf9/VhMYNBHf0VTzfaRRW1Zhr4I1AeZLhgNbLGBCstaTgyaXUCWn4cNzAOg\nt3vm695uSq7afpRRa0C7RL852fDy6zxQMvg53LJdS1iUZp5+73YG/80X4lkSQc3n\nQ8C2xcPXeG6JXF+vhZMn9wc8KVhr5/EnppF3UGlaR4D21K0cW16OixvV7EuTGfEW\nxUZtv6CeE692y2I3nQZw0t1aSpwpmJM540VgUmETGq8JXThAloBe1bAP8xhfijc9\nbNP7UYwlAgMBAAECggEAE1hT+VxoqoR0IRTY2f5h0ByGeOtfSr8t13u4YkMI9nYk\nMYnkYpqednf9GmPz93ToecPANykpkTSCGWfpjSsnv+bz8oJBrvU25LhzjeQdbBK+\nJVhsc2QjMCRI4KEcCOVJYoa3jnA3TnhI16Hicxa327lDFPUOxWhpzKHK3Vc3GRyV\na6Qh7C+uoaKRbLZs9QsHN2LFX3ZNQ2kkjr5PWIqtTYKaiifZ5ppYBErH9aV5+xyH\nbg+vz6DY7gDiX3qGg+u/LrsmTDgJOhtft6wv3FDZUg948P56RSRiWv4f33vrq+8V\nYdlvpE+b9X/xL1u9Wh48eAlXoCrpFWSQP74dsq+n2QKBgQDd3gNx81NqzXT3GEqT\nIqeEphrlqSkVRL9X/us+N+qEP198u7mCKTY5morocTSwazMnwtSeGxlhIb59FywH\nzRVr0lJLEmSyWlNmno3E2/jwBbtKNbi6zc0mkYh+ev0VskNa60RPhjM2jG0KgqO1\n0M1D7RTzWB1GqtvWYActNxOsIwKBgQDSSCDYbJnoQKA47xmzjXIB0yTbkxfiwvIP\nwdJisbZOxedWXCIKmWl6n7HIw9ZfN35m7AECX/5KrGkbzem7Rk8hxYg9S7L36chD\nwITArIPsw+Lrh5oBC7Rd/m313JZYX9PCyPwt5PGZRodSXfdUo51TRj0U+w9aBgU8\n3Smwc7lnFwKBgDwVZ7FwR+LgiRBxj6CQ/fS6VwZi7TFJUNgvvN04n1X5I47P98j8\nCCdJZtzT64TrQws9g/7dL95SGRgfMllafLaaWpbiAEsckwFzZsktGRlHNBVAvyo3\nmZscRm6aN/esMvloRTOUEEJxfQYfot4WEcCXb9kGv8bndmlzz/26sKUpAoGAVOsv\n6HajCLngel2EgZAjdD0ya0HRqY+UdWyOa7DcsJ8XNzbpwGIHyK9o+myry7P7ZdD0\n72KYrMtHfyT+uNRB7J96z1YcpiVQ7Jt4gN6qQBkzMG6IcNerNTIkcd9tD69TMxw7\nSsVkE8P5rfeohBO22wRIcoqYvoAj6VpfFZUGUG0CgYEA0msmpy4Bo+UIaUix0hyW\nBV0rAVNC8r/YxH2AE23QHriDPrdZPKC8IauxxOSYkyu+tt4tplCfqDiT5jZr2Kzo\nXKkHGRB2zBL69UM+EsdTTqubzAgaiwOlFOb3PJVzuS8xtWQCCYHvINp27umdhdVi\n7CY4VXUrjDBvHatNawnFuk4=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-50cu3@meteor-vue-fb643.iam.gserviceaccount.com",
  "client_id": "110615919374658839855",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-50cu3%40meteor-vue-fb643.iam.gserviceaccount.com"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts",
    ".mjs",
    ".vue"
  ]
});

var exports = require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9zZXJ2aWNlcy9GaXJlYmFzZUFkbWluLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL3NlcnZpY2VzL01haWxTZXJ2LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL3V0aWxpdGllcy9GaWxlT3BlcmF0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci91dGlsaXRpZXMvUmVzcG9uc2VNZXNzYWdlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL3V0aWxpdGllcy9VdGlsaXRpZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvUGVybWlzc2lvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9ib3RoL2luZGV4LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9NZXNzYWdlcy9NZXNzYWdlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9NZXNzYWdlcy9NZXNzYWdlU2VlZGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9NZXNzYWdlcy9NZXNzYWdlc0N0cmwuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL01lc3NhZ2VzL01lc3NhZ2VzUHVicy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvUGVybWlzc2lvbnMvUGVybWlzc2lvbnNDdHJsLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9QZXJtaXNzaW9ucy9QZXJtaXNzaW9uc1B1YnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL1Byb2ZpbGVzL1Byb2ZpbGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL1Byb2ZpbGVzL1Byb2ZpbGVTZWVkZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL1Byb2ZpbGVzL1Byb2ZpbGVzQ3RybC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvUHJvZmlsZXMvUHJvZmlsZXNQdWJzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9Qcm9maWxlcy9Qcm9maWxlc1NlcnYuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL1N5c3RlbU9wdGlvbnMvU3lzdGVtT3B0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvU3lzdGVtT3B0aW9ucy9TeXN0ZW1PcHRpb25zQ3RybC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvVXNlcnMvVXNlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvVXNlcnMvVXNlclByZXNlbmNlQ29uZmlnLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9Vc2Vycy9Vc2Vyc0N0cmwuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL1VzZXJzL1VzZXJzUHVicy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvVXNlcnMvVXNlcnNTZXJ2LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21pZGRsZXdhcmVzL0F1dGhHdWFyZC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9taWRkbGV3YXJlcy9QZXJtaXNzaW9uc01pZGRsZXdhcmUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsImZpcmViYXNlQWRtaW5TdG9yYWdlIiwiQkFTRV9VUkxfU1RPUkFHRSIsImZpcmViYXNlQWRtaW4iLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJzZXJ2aWNlQWNjb3VudCIsImluaXRpYWxpemVBcHAiLCJjcmVkZW50aWFsIiwiY2VydCIsInN0b3JhZ2VCdWNrZXQiLCJzdG9yYWdlIiwiYnVja2V0IiwiTWV0ZW9yIiwiaXNEZXZlbG9wbWVudCIsInNldHRpbmdzIiwicHJpdmF0ZSIsIlNFTkRFUl9FTUFJTFMiLCJwcm9jZXNzIiwiZW52IiwiRU1BSUxfU0VSVklDRVMiLCJTRVJWSUNFUyIsImNvbnNvbGUiLCJ3YXJuIiwibmFtZSIsImVtYWlsIiwiZnJvbSIsIkFjY291bnRzIiwiZW1haWxUZW1wbGF0ZXMiLCJzaXRlTmFtZSIsImVtYWlsRW5yb2xsQWNjb3VudCIsImVtYWlsUmVzZXRQYXNzd29yZCIsImVtYWlsVmVyaWZ5RW1haWwiLCJwcm9kdWN0U3JjIiwibG9nb1NyYyIsImVucm9sbEFjY291bnQiLCJzdWJqZWN0IiwiaHRtbCIsInVzZXIiLCJ1cmwiLCJ1cmxXaXRob3V0SGFzaCIsInJlcGxhY2UiLCJpbmZvIiwiU1NSIiwiY29tcGlsZVRlbXBsYXRlIiwiQXNzZXRzIiwiZ2V0VGV4dCIsInJlbmRlciIsInJlc2V0UGFzc3dvcmQiLCJ2ZXJpZnlFbWFpbCIsIk1BSUxfVVJMIiwiUmVzcG9uc2VNZXNzYWdlIiwibWltZXR5cGVzIiwiVXRpbGl0aWVzIiwiZXhwb3J0RGVmYXVsdCIsInNhdmVGaWxlRnJvbUJ1ZmZlclRvR29vZ2xlU3RvcmFnZSIsImZpbGVCdWZmZXIiLCJwYXRoIiwibWltZVR5cGUiLCJyZXNwb25zZU1lc3NhZ2UiLCJmaWxlbmFtZSIsImdlbmVyYXRlTnVtYmVyVG9rZW4iLCJkZXRlY3RFeHRlbnNpb24iLCJmaWxlIiwiZmlsZVVybCIsInNhdmUiLCJtZXRhZGF0YSIsImNvbnRlbnRUeXBlIiwicHVibGljIiwiY3JlYXRlIiwic3VjY2VzcyIsImVycm9yIiwic2F2ZUZpbGVGcm9tQmFzZTY0VG9Hb29nbGVTdG9yYWdlIiwiYmFzZTY0ZmlsZSIsIm1hdGNoIiwiYmFzZTY0RW5jb2RlZEltYWdlU3RyaW5nIiwic3BsaXQiLCJwb3AiLCJCdWZmZXIiLCJkZWxldGVGaWxlRnJvbUdvb2dsZVN0b3JhZ2VJZkV4aXN0cyIsImZpbGVMb2NhdGlvbiIsImV4aXN0c0ZpbGUiLCJleGlzdHMiLCJkZWxldGUiLCJkZWxldGVGaWxlc09mRm9sZGVyRnJvbUdvb2dsZVN0b3JhZ2UiLCJ1c2VyRm9sZGVyIiwiZGVsZXRlRmlsZXMiLCJwcmVmaXgiLCJjb25zdHJ1Y3RvciIsIm1lc3NhZ2UiLCJkZXNjcmlwdGlvbiIsImRhdGEiLCJtaW4iLCJtYXgiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJwZXJtaXNzaW9uc0FycmF5IiwiUGVybWlzc2lvbnMiLCJVU0VSUyIsIkxJU1QiLCJWQUxVRSIsIlRFWFQiLCJDUkVBVEUiLCJVUERBVEUiLCJERUxFVEUiLCJQUk9GSUxFUyIsIlBFUk1JU1NJT05TIiwiQ0hBVCIsIk9iamVjdCIsImtleXMiLCJyZWR1Y2UiLCJhY2N1bXVsYXRvciIsInN5c3RlbU1vZHVsZU5hbWUiLCJzeXN0ZW1Nb2R1bGVPYmplY3QiLCJtb2R1bGVQZXJtaXNzaW9ucyIsIm1hcCIsInBlcm1pc3Npb24iLCJjb25jYXQiLCJSRUZSRVNIX1BFUk1JU1NJT05TIiwibG9nIiwiY3VycmVudFJvbGVzIiwiUm9sZXMiLCJnZXRBbGxSb2xlcyIsImZldGNoIiwiZmluZCIsIl9yb2xlIiwiX2lkIiwiY3JlYXRlUm9sZSIsInJvbGVzIiwidXBkYXRlIiwiJHNldCIsInB1YmxpY05hbWUiLCJjb25maWciLCJsb2dpbkV4cGlyYXRpb25JbkRheXMiLCJNZXNzYWdlIiwiTW9uZ28iLCJDb2xsZWN0aW9uIiwicmF3Q29sbGVjdGlvbiIsImNyZWF0ZUluZGV4IiwiaWRTZW5kZXIiLCJpZFJlY2VpdmVyIiwiZGF0ZSIsIlZhbGlkYXRlZE1ldGhvZCIsImNoZWNrIiwiQXV0aEd1YXJkIiwibWl4aW5zIiwiTWV0aG9kSG9va3MiLCJiZWZvcmVIb29rcyIsImNoZWNrUGVybWlzc2lvbiIsInBlcm1pc3Npb25zIiwidmFsaWRhdGUiLCJTdHJpbmciLCJ0ZXh0IiwicmVhZCIsIkJvb2xlYW4iLCJFcnJvciIsInJ1biIsImluc2VydCIsImlzVXNlckxvZ2dlZCIsIm1lc3NhZ2VzIiwiJGluIiwibSIsIm11bHRpIiwiUGVybWlzc2lvbk1pZGRsZXdhcmUiLCJtZXNzYWdlc1B1YmxpY2F0aW9uIiwiUHVibGlzaEVuZHBvaW50IiwiaWRDb250YWN0IiwiaWRVc2VyTG9nZ2VkIiwidXNlcklkIiwiJG9yIiwibGltaXQiLCJzb3J0IiwidXNlIiwiUHJvZmlsZSIsImlkUHJvZmlsZSIsInByb2ZpbGUiLCJmaW5kT25lIiwiJG5pbiIsIiRub3QiLCJzY29wZSIsImdldFNjb3Blc0ZvclVzZXIiLCJoYXNQZXJtaXNzaW9uIiwidXNlcklzSW5Sb2xlIiwicHVibGlzaCIsInJvbGVBc3NpZ25tZW50IiwiU3RhdGljUHJvZmlsZXMiLCJ1bmlxdWUiLCJhZG1pbiIsInAiLCJSRUZSRVNIX1NUQVRJQ19QUk9GSUxFUyIsImZvckVhY2giLCJzdGF0aWNQcm9maWxlTmFtZSIsInVwc2VydCIsInVzZXJzIiwicmVtb3ZlIiwibGVuZ3RoIiwic2V0VXNlclJvbGVzIiwiTWF0Y2giLCJQcm9maWxlc1NlcnYiLCJPbmVPZiIsInZhbGlkYXRlTmFtZSIsIm9sZFByb2ZpbGUiLCJnZXRVc2Vyc0J5UHJvZmlsZSIsInVwZGF0ZVByb2ZpbGVVc2VycyIsIm5vU3RhdGljUHJvZmlsZXNQdWJsaWNhdGlvbiIsImdldFN0YXRpY1Byb2ZpbGVOYW1lIiwicHJvZmlsZXNQdWJsaWNhdGlvbiIsImV4aXN0TmFtZSIsImlkVXNlciIsInByb2ZpbGVOYW1lIiwidGl0bGUiLCJyb3V0ZU5hbWUiLCJTeXN0ZW1PcHRpb25zIiwidXNlckxvZ2dlZCIsInVzZXJSb2xlcyIsImdldFJvbGVzRm9yVXNlciIsIm9wdGlvbnNPZlVzZXIiLCJzeXN0ZW1PcHRpb24iLCJyb2xlIiwicHVzaCIsIlVzZXIiLCJTaW1wbGVTY2hlbWEiLCJVc2VyUHJvZmlsZVNjaGVtYSIsInR5cGUiLCJvcHRpb25hbCIsImJsYWNrYm94IiwiYXR0YWNoU2NoZW1hIiwiVXNlclByZXNlbmNlIiwiU3RhdHVzU2NoZW1hIiwic3RhdHVzIiwib25DbGVhbnVwIiwic2Vzc2lvbklkcyIsIiR1bnNldCIsIm9uVXNlck9ubGluZSIsImNvbm5lY3Rpb24iLCJEYXRlIiwiaXBBZGRyIiwiY2xpZW50QWRkcmVzcyIsInVzZXJBZ2VudCIsImh0dHBIZWFkZXJzIiwib25Vc2VySWRsZSIsIm9uVXNlck9mZmxpbmUiLCJVc2Vyc1NlcnYiLCJvbkNyZWF0ZVVzZXIiLCJvcHRpb25zIiwiY3VzdG9taXplZFVzZXIiLCJhc3NpZ24iLCJvbmxpbmUiLCJ2YWxpZGF0ZUxvZ2luQXR0ZW1wdCIsImxvZ2luQXR0ZW1wdCIsImFsbG93ZWQiLCJlbWFpbHMiLCJ2ZXJpZmllZCIsImxvZ2luVG9rZW5zT2ZVc2VyIiwic2VydmljZXMiLCJyZXN1bWUiLCJsb2dpblRva2VucyIsInVzZXJuYW1lIiwiYWRkcmVzcyIsInZhbGlkYXRlRW1haWwiLCJ2YWxpZGF0ZVVzZXJuYW1lIiwicGhvdG9GaWxlVXNlciIsInVwZGF0ZVVzZXIiLCJjcmVhdGVVc2VyIiwiZGVsZXRlVXNlciIsInVzZXJzUHVibGljYXRpb24iLCJjcmVhdGVkQXQiLCJGaWxlT3BlcmF0aW9ucyIsIlBBVEhfVVNFUl9GSUxFUyIsIm5ld0VtYWlsIiwiZXhpc3RFbWFpbCIsImZpbmRVc2VyQnlFbWFpbCIsIm9sZFVzZXIiLCJuZXdVc2VybmFtZSIsImV4aXN0VXNlcm5hbWUiLCJmaW5kVXNlckJ5VXNlcm5hbWUiLCJhdmF0YXJTcmMiLCJzZW5kRW5yb2xsbWVudEVtYWlsIiwicmVzcG9uc2UiLCJjdXJyZW50VXNlciIsInJlbW92ZUVtYWlsIiwiYWRkRW1haWwiLCJzZW5kVmVyaWZpY2F0aW9uRW1haWwiLCJzZXRVc2VybmFtZSIsInN1YnN0cmluZyIsImluZGV4T2YiLCJtZXRob2RBcmdzIiwibWV0aG9kT3B0aW9ucyIsIlB1Ymxpc2hNaWRkbGV3YXJlIiwiX3Blcm1pc3Npb25zIiwiYWRkZWQiLCJjb2xsZWN0aW9uIiwiaWQiLCJmaWVsZHMiLCJhcmd1bWVudHMiLCJyZWFkeSIsImNoYW5nZSIsImNoYW5nZWQiLCJyZW1vdmVkIiwib25SZWFkeSIsIm9uU3RvcCIsIm9uRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQUNDLHNCQUFvQixFQUFDLE1BQUlBLG9CQUExQjtBQUErQ0Msa0JBQWdCLEVBQUMsTUFBSUE7QUFBcEUsQ0FBZDtBQUFxRyxJQUFJQyxhQUFKO0FBQWtCSixNQUFNLENBQUNLLElBQVAsQ0FBWSxnQkFBWixFQUE2QjtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDSCxpQkFBYSxHQUFDRyxDQUFkO0FBQWdCOztBQUE1QixDQUE3QixFQUEyRCxDQUEzRDtBQUE4RCxJQUFJQyxjQUFKO0FBQW1CUixNQUFNLENBQUNLLElBQVAsQ0FBWSwrRUFBWixFQUE0RjtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDQyxrQkFBYyxHQUFDRCxDQUFmO0FBQWlCOztBQUE3QixDQUE1RixFQUEySCxDQUEzSDtBQUd4TUgsYUFBYSxDQUFDSyxhQUFkLENBQTRCO0FBQ3hCQyxZQUFVLEVBQUVOLGFBQWEsQ0FBQ00sVUFBZCxDQUF5QkMsSUFBekIsQ0FBOEJILGNBQTlCLENBRFk7QUFFeEJJLGVBQWEsRUFBRTtBQUZTLENBQTVCO0FBS08sTUFBTVYsb0JBQW9CLEdBQUdFLGFBQWEsQ0FBQ1MsT0FBZCxHQUF3QkMsTUFBeEIsRUFBN0I7QUFFQSxNQUFNWCxnQkFBZ0IsR0FBRyxnQ0FBekIsQzs7Ozs7Ozs7Ozs7QUNWUCxJQUFJWSxNQUFNLENBQUNDLGFBQVgsRUFBMEI7QUFBQTs7QUFDdEIsK0JBQUlELE1BQU0sQ0FBQ0UsUUFBUCxDQUFnQkMsT0FBcEIsa0RBQUksc0JBQXlCQyxhQUE3QixFQUE0QztBQUN4Q0MsV0FBTyxDQUFDQyxHQUFSLENBQVlDLGNBQVosR0FBNkJQLE1BQU0sQ0FBQ0UsUUFBUCxDQUFnQkMsT0FBaEIsQ0FBd0JDLGFBQXhCLENBQXNDSSxRQUFuRTtB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cmViYXNlQWRtaW4gZnJvbSAnZmlyZWJhc2UtYWRtaW4nO1xyXG5pbXBvcnQgc2VydmljZUFjY291bnQgZnJvbSAnLi4vLi4vLi4vLi4vc2V0dGluZ3MvbWV0ZW9yLXZ1ZS1mYjY0My1maXJlYmFzZS1hZG1pbnNkay01MGN1My00YzI4NzQxMWRhLmpzb24nO1xyXG5cclxuZmlyZWJhc2VBZG1pbi5pbml0aWFsaXplQXBwKHtcclxuICAgIGNyZWRlbnRpYWw6IGZpcmViYXNlQWRtaW4uY3JlZGVudGlhbC5jZXJ0KHNlcnZpY2VBY2NvdW50KSxcclxuICAgIHN0b3JhZ2VCdWNrZXQ6ICdtZXRlb3ItdnVlLWZiNjQzLmFwcHNwb3QuY29tJ1xyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBmaXJlYmFzZUFkbWluU3RvcmFnZSA9IGZpcmViYXNlQWRtaW4uc3RvcmFnZSgpLmJ1Y2tldCgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJBU0VfVVJMX1NUT1JBR0UgPSAnaHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tJzsiLCJpZiAoTWV0ZW9yLmlzRGV2ZWxvcG1lbnQpIHtcclxuICAgIGlmIChNZXRlb3Iuc2V0dGluZ3MucHJpdmF0ZT8uU0VOREVSX0VNQUlMUykge1xyXG4gICAgICAgIHByb2Nlc3MuZW52LkVNQUlMX1NFUlZJQ0VTID0gTWV0ZW9yLnNldHRpbmdzLnByaXZhdGUuU0VOREVSX0VNQUlMUy5TRVJWSUNFUztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignW01ldGVvciArIFZ1ZV0gLSBTZW5kZXIgZW1haWxzIGFyZSBub3QgY29uZmlndXJlZCwgRW1haWxzIHdpbGwgbm90IGJlIHNlbmQnKTtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgbmFtZSA9ICdTY2FmZm9sZCBNZXRvciArIFZ1ZSc7XHJcbmNvbnN0IGVtYWlsID0gYDwke3Byb2Nlc3MuZW52LkVNQUlMX1NFUlZJQ0VTfT5gO1xyXG5jb25zdCBmcm9tID0gYCR7bmFtZX0gJHtlbWFpbH1gO1xyXG5cclxuQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuc2l0ZU5hbWUgPSBuYW1lO1xyXG5BY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5mcm9tID0gZnJvbTtcclxuY29uc3QgZW1haWxUZW1wbGF0ZXMgPSBBY2NvdW50cy5lbWFpbFRlbXBsYXRlcztcclxuXHJcbmNvbnN0IGVtYWlsRW5yb2xsQWNjb3VudCA9ICdlbWFpbF9lbnJvbGxfYWNjb3VudC5odG1sJztcclxuY29uc3QgZW1haWxSZXNldFBhc3N3b3JkID0gJ2VtYWlsX3Jlc2V0X3Bhc3N3b3JkLmh0bWwnO1xyXG5jb25zdCBlbWFpbFZlcmlmeUVtYWlsID0gJ2VtYWlsX3ZlcmlmeV9lbWFpbC5odG1sJztcclxuXHJcbmNvbnN0IHByb2R1Y3RTcmMgPSAnaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi9tZXRlb3ItdnVlLWZiNjQzLmFwcHNwb3QuY29tL28vdnVlLW1ldGVvci5wbmc/YWx0PW1lZGlhJ1xyXG5jb25zdCBsb2dvU3JjID0gJ2h0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvbWV0ZW9yLXZ1ZS1mYjY0My5hcHBzcG90LmNvbS9vL1Bvd2VyZWREYXJrLnBuZz9hbHQ9bWVkaWEnXHJcblxyXG5lbWFpbFRlbXBsYXRlcy5lbnJvbGxBY2NvdW50ID0ge1xyXG4gICAgc3ViamVjdCgpIHtcclxuICAgICAgICByZXR1cm4gYEJpZW52ZW5pZG8gYSAke25hbWV9YDtcclxuICAgIH0sXHJcbiAgICBodG1sICh1c2VyLCB1cmwpIHtcclxuICAgICAgICBjb25zdCB1cmxXaXRob3V0SGFzaCA9IHVybC5yZXBsYWNlKCcjLycsICcnKTtcclxuICAgICAgICBpZiAoTWV0ZW9yLmlzRGV2ZWxvcG1lbnQpIGNvbnNvbGUuaW5mbygnU2V0IGluaXRpYWwgcGFzc3dvcmQgbGluazogJywgdXJsV2l0aG91dEhhc2gpO1xyXG4gICAgICAgIFNTUi5jb21waWxlVGVtcGxhdGUoJ2VtYWlsRW5yb2xsQWNjb3VudCcsIEFzc2V0cy5nZXRUZXh0KGVtYWlsRW5yb2xsQWNjb3VudCkpO1xyXG4gICAgICAgIHJldHVybiBTU1IucmVuZGVyKCdlbWFpbEVucm9sbEFjY291bnQnLCB7XHJcbiAgICAgICAgICAgIHVybFdpdGhvdXRIYXNoLFxyXG4gICAgICAgICAgICBwcm9kdWN0U3JjLFxyXG4gICAgICAgICAgICBsb2dvU3JjXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5lbWFpbFRlbXBsYXRlcy5yZXNldFBhc3N3b3JkID0ge1xyXG4gICAgc3ViamVjdCgpIHtcclxuICAgICAgICByZXR1cm4gYFJlc3RhYmxlY2UgdHUgY29udHJhc2XDsWFgO1xyXG4gICAgfSxcclxuICAgIGh0bWwgKHVzZXIsIHVybCkge1xyXG4gICAgICAgIGNvbnN0IHVybFdpdGhvdXRIYXNoID0gdXJsLnJlcGxhY2UoJyMvJywgJycpO1xyXG4gICAgICAgIGlmIChNZXRlb3IuaXNEZXZlbG9wbWVudCkgY29uc29sZS5pbmZvKCdQYXNzd29yZCByZXNldCBsaW5rOiAnLCB1cmxXaXRob3V0SGFzaCk7XHJcbiAgICAgICAgU1NSLmNvbXBpbGVUZW1wbGF0ZSgnZW1haWxSZXNldFBhc3N3b3JkJywgQXNzZXRzLmdldFRleHQoZW1haWxSZXNldFBhc3N3b3JkKSk7XHJcbiAgICAgICAgcmV0dXJuIFNTUi5yZW5kZXIoJ2VtYWlsUmVzZXRQYXNzd29yZCcsIHtcclxuICAgICAgICAgICAgdXJsV2l0aG91dEhhc2gsXHJcbiAgICAgICAgICAgIHByb2R1Y3RTcmMsXHJcbiAgICAgICAgICAgIGxvZ29TcmNcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuXHJcbmVtYWlsVGVtcGxhdGVzLnZlcmlmeUVtYWlsID0ge1xyXG4gICAgc3ViamVjdCgpIHtcclxuICAgICAgICByZXR1cm4gYFZlcmlmaWNhIHR1IGNvcnJlb2A7XHJcbiAgICB9LFxyXG4gICAgaHRtbCAodXNlciwgdXJsKSB7XHJcbiAgICAgICAgY29uc3QgdXJsV2l0aG91dEhhc2ggPSB1cmwucmVwbGFjZSgnIy8nLCAnJyk7XHJcbiAgICAgICAgaWYgKE1ldGVvci5pc0RldmVsb3BtZW50KSBjb25zb2xlLmluZm8oJ1ZlcmlmeSBlbWFpbCBsaW5rOiAnLCB1cmxXaXRob3V0SGFzaCk7XHJcbiAgICAgICAgU1NSLmNvbXBpbGVUZW1wbGF0ZSgnZW1haWxWZXJpZnlFbWFpbCcsIEFzc2V0cy5nZXRUZXh0KGVtYWlsVmVyaWZ5RW1haWwpKTtcclxuICAgICAgICByZXR1cm4gU1NSLnJlbmRlcignZW1haWxWZXJpZnlFbWFpbCcsIHtcclxuICAgICAgICAgICAgdXJsV2l0aG91dEhhc2gsXHJcbiAgICAgICAgICAgIHByb2R1Y3RTcmMsXHJcbiAgICAgICAgICAgIGxvZ29TcmNcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuXHJcbmlmIChNZXRlb3IuaXNEZXZlbG9wbWVudCkge1xyXG4gICAgaWYgKE1ldGVvci5zZXR0aW5ncy5wcml2YXRlPy5NQUlMX1VSTCkge1xyXG4gICAgICAgIHByb2Nlc3MuZW52Lk1BSUxfVVJMID0gTWV0ZW9yLnNldHRpbmdzLnByaXZhdGUuTUFJTF9VUkw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1tNZXRlb3IgKyBWdWVdIC0gRW1haWwgc2V0dGluZ3MgYXJlIG5vdCBjb25maWd1cmVkLCBFbWFpbHMgd2lsbCBub3QgYmUgc2VuZCcpO1xyXG4gICAgfVxyXG59OyIsImltcG9ydCB7IFJlc3BvbnNlTWVzc2FnZSB9IGZyb20gXCIuL1Jlc3BvbnNlTWVzc2FnZVwiO1xyXG5pbXBvcnQgbWltZXR5cGVzIGZyb20gJ21pbWV0eXBlcyc7XHJcbmltcG9ydCBVdGlsaXRpZXMgZnJvbSBcIi4vVXRpbGl0aWVzXCI7XHJcbmltcG9ydCB7IEJBU0VfVVJMX1NUT1JBR0UsIGZpcmViYXNlQWRtaW5TdG9yYWdlIH0gZnJvbSBcIi4uL3NlcnZpY2VzL0ZpcmViYXNlQWRtaW5cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGFzeW5jIHNhdmVGaWxlRnJvbUJ1ZmZlclRvR29vZ2xlU3RvcmFnZSAoZmlsZUJ1ZmZlciwgbmFtZSwgcGF0aCwgbWltZVR5cGUpe1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG5ldyBSZXNwb25zZU1lc3NhZ2UoKTtcclxuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGAke25hbWV9JHtVdGlsaXRpZXMuZ2VuZXJhdGVOdW1iZXJUb2tlbigxMCwgOTkpfS4ke21pbWV0eXBlcy5kZXRlY3RFeHRlbnNpb24obWltZVR5cGUpfWA7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IGZpcmViYXNlQWRtaW5TdG9yYWdlLmZpbGUoYCR7cGF0aH0vJHtmaWxlbmFtZX1gKTtcclxuICAgICAgICBjb25zdCBmaWxlVXJsID0gYCR7QkFTRV9VUkxfU1RPUkFHRX0vJHtmaXJlYmFzZUFkbWluU3RvcmFnZS5uYW1lfS8ke3BhdGh9LyR7ZmlsZW5hbWV9YDtcclxuICAgICAgICBcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBmaWxlLnNhdmUoZmlsZUJ1ZmZlciwge1xyXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogbWltZVR5cGVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwdWJsaWM6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlTWVzc2FnZS5jcmVhdGUoJ0ZpbGUgdXBsb2FkZWQnLCBudWxsLCB7c3VjY2VzczogdHJ1ZSwgZmlsZVVybH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwbG9hZGluZyBmaWxlIHRvIEdvb2dsZSBTdG9yYWdlJyk7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlTWVzc2FnZS5jcmVhdGUoJ0Vycm9yIHVwbG9hZGluZyBmaWxlIHRvIEdvb2dsZSBTdG9yYWdlJywgbnVsbCwge3N1Y2Nlc3M6IGZhbHNlfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZU1lc3NhZ2U7XHJcbiAgICB9LFxyXG4gICAgYXN5bmMgc2F2ZUZpbGVGcm9tQmFzZTY0VG9Hb29nbGVTdG9yYWdlKGJhc2U2NGZpbGUsIG5hbWUsIHBhdGgpe1xyXG4gICAgICAgIGNvbnN0IG1pbWVUeXBlID0gYmFzZTY0ZmlsZS5tYXRjaCgvZGF0YTooW2EtekEtWjAtOV0rXFwvW2EtekEtWjAtOS0uK10rKS4qLC4qLylbMV07XHJcbiAgICAgICAgY29uc3QgYmFzZTY0RW5jb2RlZEltYWdlU3RyaW5nID0gYmFzZTY0ZmlsZS5zcGxpdCgnO2Jhc2U2NCwnKS5wb3AoKTtcclxuICAgICAgICBjb25zdCBmaWxlQnVmZmVyID0gQnVmZmVyLmZyb20oYmFzZTY0RW5jb2RlZEltYWdlU3RyaW5nLCAnYmFzZTY0Jyk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc2F2ZUZpbGVGcm9tQnVmZmVyVG9Hb29nbGVTdG9yYWdlKGZpbGVCdWZmZXIsIG5hbWUsIHBhdGgsIG1pbWVUeXBlKTtcclxuICAgIH0sXHJcbiAgICBhc3luYyBkZWxldGVGaWxlRnJvbUdvb2dsZVN0b3JhZ2VJZkV4aXN0cyhmaWxlTG9jYXRpb24pIHtcclxuICAgICAgICBjb25zdCBmaWxlID0gZmlyZWJhc2VBZG1pblN0b3JhZ2UuZmlsZShmaWxlTG9jYXRpb24pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0c0ZpbGUgPSBhd2FpdCBmaWxlLmV4aXN0cygpO1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RzRmlsZVswXSkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgZmlsZS5kZWxldGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0ZSBmaWxlIGZyb20gR29vZ2xlIFN0b3JhZ2UnLCBlcnJvcik7ICAgIFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhc3luYyBkZWxldGVGaWxlc09mRm9sZGVyRnJvbUdvb2dsZVN0b3JhZ2UgKHVzZXJGb2xkZXIpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBmaXJlYmFzZUFkbWluU3RvcmFnZS5kZWxldGVGaWxlcyh7cHJlZml4OiB1c2VyRm9sZGVyICsgJy8nfSlcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkZWxldGluZyBmaWxlcyBmcm9tIEdvb2dsZSBTdG9yYWdlOiAnLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsImV4cG9ydCBjbGFzcyBSZXNwb25zZU1lc3NhZ2Uge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNyZWF0ZShtZXNzYWdlLCBkZXNjcmlwdGlvbiA9IG51bGwsIGRhdGEgPSBudWxsKXtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgZ2VuZXJhdGVOdW1iZXJUb2tlbiAobWluLCBtYXgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pICsgbWluKTtcclxuICAgIH1cclxufSIsImNvbnN0IFBlcm1pc3Npb25zID0geyBcclxuICAgIFVTRVJTOiB7XHJcbiAgICAgICAgTElTVDoge1ZBTFVFOiAndXNlcnMtdmlldycsIFRFWFQ6ICdMaXN0YXIgdXN1YXJpb3MnfSxcclxuICAgICAgICBDUkVBVEU6IHtWQUxVRTogJ3VzZXJzLWNyZWF0ZScsIFRFWFQ6ICdDcmVhciB1c3VhcmlvJ30sXHJcbiAgICAgICAgVVBEQVRFOiB7VkFMVUU6ICd1c2Vycy1lZGl0JywgVEVYVDogJ0FjdHVhbGl6YXIgdXN1YXJpbyd9LFxyXG4gICAgICAgIERFTEVURToge1ZBTFVFOiAndXNlcnMtZGVsZXRlJywgVEVYVDogJ0VsaW1pbmFyIHVzdWFyaW8nfVxyXG4gICAgfSwgXHJcbiAgICBQUk9GSUxFUzoge1xyXG4gICAgICAgIExJU1Q6IHtWQUxVRTogJ3Byb2ZpbGVzLXZpZXcnLCBURVhUOiAnTGlzdGFyIHBlcmZpbGVzJ30sXHJcbiAgICAgICAgQ1JFQVRFOiB7VkFMVUU6ICdwcm9maWxlcy1jcmVhdGUnLCBURVhUOiAnQ3JlYXIgcGVyZmlsJ30sXHJcbiAgICAgICAgVVBEQVRFOiB7VkFMVUU6ICdwcm9maWxlcy1lZGl0JywgVEVYVDogJ0FjdHVhbGl6YXIgcGVyZmlsJ30sXHJcbiAgICAgICAgREVMRVRFOiB7VkFMVUU6ICdwcm9maWxlcy1kZWxldGUnLCBURVhUOiAnRWxpbWluYXIgcGVyZmlsJ31cclxuICAgIH0sXHJcbiAgICBQRVJNSVNTSU9OUzoge1xyXG4gICAgICAgIExJU1Q6IHtWQUxVRTogJ3Blcm1pc3Npb25zLXZpZXcnLCBURVhUOiAnTGlzdGFyIHBlcm1pc29zJ31cclxuICAgIH0sXHJcbiAgICBDSEFUOiB7XHJcbiAgICAgICAgQ1JFQVRFOiB7VkFMVUU6ICdtZXNzYWdlcy1jcmVhdGUnLCBURVhUOiAnRW52aWFyIG1lbnNhamVzIGRlIGNoYXQnfSxcclxuICAgICAgICBMSVNUOiB7VkFMVUU6ICdtZXNzYWdlcy12aWV3JywgVEVYVDogJ1ZlciBtZW5zYWplcyBkZSBjaGF0J31cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBwZXJtaXNzaW9uc0FycmF5ID0gT2JqZWN0LmtleXMoUGVybWlzc2lvbnMpLnJlZHVjZSgoYWNjdW11bGF0b3IsIHN5c3RlbU1vZHVsZU5hbWUpID0+IHtcclxuICAgIGNvbnN0IHN5c3RlbU1vZHVsZU9iamVjdCA9IFBlcm1pc3Npb25zW3N5c3RlbU1vZHVsZU5hbWVdO1xyXG4gICAgY29uc3QgbW9kdWxlUGVybWlzc2lvbnMgPSBPYmplY3Qua2V5cyhzeXN0ZW1Nb2R1bGVPYmplY3QpLm1hcChwZXJtaXNzaW9uID0+IHN5c3RlbU1vZHVsZU9iamVjdFtwZXJtaXNzaW9uXSk7XHJcbiAgICByZXR1cm4gYWNjdW11bGF0b3IuY29uY2F0KG1vZHVsZVBlcm1pc3Npb25zKTtcclxufSwgW10pO1xyXG5cclxuaWYgKE1ldGVvci5pc0RldmVsb3BtZW50KSB7XHJcbiAgICBpZiAoTWV0ZW9yLnNldHRpbmdzLnByaXZhdGUgJiYgTWV0ZW9yLnNldHRpbmdzLnByaXZhdGUuUkVGUkVTSF9QRVJNSVNTSU9OUykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd1cGxhZGluZyBwZXJtaXNzaW9ucy4gLiAuJyk7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFJvbGVzID0gUm9sZXMuZ2V0QWxsUm9sZXMoKS5mZXRjaCgpO1xyXG4gICAgICAgIGZvciAobGV0IHBlcm1pc3Npb24gb2YgcGVybWlzc2lvbnNBcnJheSkge1xyXG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRSb2xlcy5maW5kKF9yb2xlID0+IF9yb2xlLl9pZCA9PT0gcGVybWlzc2lvbi5WQUxVRSkpIHtcclxuICAgICAgICAgICAgICAgIFJvbGVzLmNyZWF0ZVJvbGUocGVybWlzc2lvbi5WQUxVRSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTWV0ZW9yLnJvbGVzLnVwZGF0ZShwZXJtaXNzaW9uLlZBTFVFLCB7XHJcbiAgICAgICAgICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTmFtZTogcGVybWlzc2lvbi5URVhUXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGVybWlzc2lvbnM7IiwiaW1wb3J0ICcuL1Blcm1pc3Npb25zJztcclxuXHJcbmltcG9ydCAnLi9zZXJ2aWNlcy9NYWlsU2Vydic7XHJcbmltcG9ydCAnLi9zZXJ2aWNlcy9GaXJlYmFzZUFkbWluJztcclxuXHJcbmltcG9ydCAnLi4vLi4vYXBpL1VzZXJzL1VzZXInO1xyXG5pbXBvcnQgJy4uLy4uL2FwaS9Vc2Vycy9Vc2Vyc0N0cmwnO1xyXG5pbXBvcnQgJy4uLy4uL2FwaS9Vc2Vycy9Vc2Vyc1B1YnMnOyBcclxuXHJcbmltcG9ydCAnLi4vLi4vYXBpL1Byb2ZpbGVzL1Byb2ZpbGVTZWVkZXInO1xyXG5pbXBvcnQgJy4uLy4uL2FwaS9Qcm9maWxlcy9Qcm9maWxlc0N0cmwnO1xyXG5pbXBvcnQgJy4uLy4uL2FwaS9Qcm9maWxlcy9Qcm9maWxlc1B1YnMnO1xyXG5cclxuaW1wb3J0ICcuLi8uLi9hcGkvUGVybWlzc2lvbnMvUGVybWlzc2lvbnNDdHJsJztcclxuaW1wb3J0ICcuLi8uLi9hcGkvUGVybWlzc2lvbnMvUGVybWlzc2lvbnNQdWJzJztcclxuXHJcbmltcG9ydCAnLi4vLi4vYXBpL1N5c3RlbU9wdGlvbnMvU3lzdGVtT3B0aW9uc0N0cmwnO1xyXG5cclxuaW1wb3J0ICcuLi8uLi9hcGkvTWVzc2FnZXMvTWVzc2FnZVNlZWRlcic7XHJcbmltcG9ydCAnLi4vLi4vYXBpL01lc3NhZ2VzL01lc3NhZ2VzQ3RybCc7XHJcbmltcG9ydCAnLi4vLi4vYXBpL01lc3NhZ2VzL01lc3NhZ2VzUHVicyc7XHJcblxyXG5cclxuIiwiQWNjb3VudHMuY29uZmlnKCB7XHJcbiAgICBsb2dpbkV4cGlyYXRpb25JbkRheXM6IDMwXHJcbn0pIiwiaW1wb3J0IHtNb25nb30gZnJvbSAnbWV0ZW9yL21vbmdvJztcclxuXHJcbmV4cG9ydCBjb25zdCBNZXNzYWdlID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ21lc3NhZ2VzJyk7IiwiaW1wb3J0IHtNZXNzYWdlfSBmcm9tICcuL01lc3NhZ2UnO1xyXG5cclxuTWVzc2FnZS5yYXdDb2xsZWN0aW9uKCkuY3JlYXRlSW5kZXgoeyBpZFNlbmRlcjogMSB9KTtcclxuTWVzc2FnZS5yYXdDb2xsZWN0aW9uKCkuY3JlYXRlSW5kZXgoeyBpZFJlY2VpdmVyOiAxIH0pO1xyXG5NZXNzYWdlLnJhd0NvbGxlY3Rpb24oKS5jcmVhdGVJbmRleCh7IGRhdGU6IDEgfSk7IiwiaW1wb3J0IHtWYWxpZGF0ZWRNZXRob2R9IGZyb20gJ21ldGVvci9tZGc6dmFsaWRhdGVkLW1ldGhvZCc7XHJcbmltcG9ydCB7Y2hlY2t9IGZyb20gJ21ldGVvci9jaGVjayc7XHJcbmltcG9ydCBBdXRoR3VhcmQgZnJvbSAnLi4vLi4vbWlkZGxld2FyZXMvQXV0aEd1YXJkJztcclxuaW1wb3J0IHtSZXNwb25zZU1lc3NhZ2V9IGZyb20gJy4uLy4uL3N0YXJ0dXAvc2VydmVyL3V0aWxpdGllcy9SZXNwb25zZU1lc3NhZ2UnO1xyXG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSAnLi9NZXNzYWdlJztcclxuaW1wb3J0IFBlcm1pc3Npb25zIGZyb20gJy4uLy4uL3N0YXJ0dXAvc2VydmVyL1Blcm1pc3Npb25zJztcclxuXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ21lc3NhZ2Uuc2F2ZScsXHJcbiAgICBtaXhpbnM6IFtNZXRob2RIb29rc10sXHJcbiAgICBiZWZvcmVIb29rczogW0F1dGhHdWFyZC5jaGVja1Blcm1pc3Npb25dLFxyXG4gICAgcGVybWlzc2lvbnM6IFtQZXJtaXNzaW9ucy5DSEFULkNSRUFURS5WQUxVRV0sXHJcbiAgICB2YWxpZGF0ZSAobWVzc2FnZSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNoZWNrKG1lc3NhZ2UsIHtcclxuICAgICAgICAgICAgICAgIGlkU2VuZGVyOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICBpZFJlY2VpdmVyOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICBkYXRlOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICByZWFkOiBCb29sZWFuXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignbWVzc2FnZS5zYXZlJywgZXJyb3IpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnTGEgaW5mb3JtYWNpb24gaW50cm9kdWNpZGEgbm8gZXMgdmFsaWRhJylcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcnVuIChtZXNzYWdlKSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2VNZXNzYWdlID0gbmV3IFJlc3BvbnNlTWVzc2FnZSgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIE1lc3NhZ2UuaW5zZXJ0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICByZXNwb25zZU1lc3NhZ2UuY3JlYXRlKCdTZSBpbnNlcnRvIGVsIG1lbnNhamUgZXhpdG9zYW1lbnRlJyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignbWVzc2FnZS5zYXZlJywgZXJyb3IpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc1MDAnLCAnSGEgb2N1cnJpZG8gdW4gZXJyb3IgYWwgaW5zZXJ0YXIgZWwgbWVuc2FqZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2VNZXNzYWdlO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ21lc3NhZ2VzLnJlYWQnLFxyXG4gICAgbWl4aW5zOiBbTWV0aG9kSG9va3NdLFxyXG4gICAgYmVmb3JlSG9va3M6IFtBdXRoR3VhcmQuaXNVc2VyTG9nZ2VkXSxcclxuICAgIHZhbGlkYXRlIChtZXNzYWdlcykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNoZWNrKG1lc3NhZ2VzLCBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgX2lkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgaWRTZW5kZXI6IFN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICBpZFJlY2VpdmVyOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogU3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IFN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICByZWFkOiBCb29sZWFuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ21lc3NhZ2VzLnJlYWQnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsICdMYSBpbmZvcm1hY2lvbiBubyBlcyB2YWxpZGEnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcnVuIChtZXNzYWdlcykge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG5ldyBSZXNwb25zZU1lc3NhZ2UoKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBNZXNzYWdlLnVwZGF0ZSh7X2lkOiB7JGluOiBtZXNzYWdlcy5tYXAobSA9PiBtLl9pZCkgfX0se1xyXG4gICAgICAgICAgICAgICAgJHNldDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQ6IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSx7bXVsdGk6IHRydWV9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdtZXNzYWdlcy5yZWFkJywgZXJyb3IpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc1MDAnLCAnSGEgb2N1cnJpZG8gdW4gZXJyb3IgYWwgbWFyY2FyIGxvcyBtZW5zYWplcyBjb21vIGxlaWRvcy4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlTWVzc2FnZTtcclxuICAgIH1cclxufSk7XHJcblxyXG4iLCJpbXBvcnQgeyBQZXJtaXNzaW9uTWlkZGxld2FyZSB9IGZyb20gXCIuLi8uLi9taWRkbGV3YXJlcy9QZXJtaXNzaW9uc01pZGRsZXdhcmVcIjtcclxuaW1wb3J0IFBlcm1pc3Npb25zIGZyb20gXCIuLi8uLi9zdGFydHVwL3NlcnZlci9QZXJtaXNzaW9uc1wiO1xyXG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcIi4vTWVzc2FnZVwiO1xyXG5cclxuY29uc3QgbWVzc2FnZXNQdWJsaWNhdGlvbiA9IG5ldyBQdWJsaXNoRW5kcG9pbnQoJ21lc3NhZ2VzLmxpc3QnLCBmdW5jdGlvbihpZENvbnRhY3QgPSBudWxsKSB7XHJcbiAgIGNvbnN0IGlkVXNlckxvZ2dlZCA9IHRoaXMudXNlcklkO1xyXG4gICByZXR1cm4gTWVzc2FnZS5maW5kKHtcclxuICAgICAgICRvcjogW1xyXG4gICAgICAgICAgIHtpZFNlbmRlcjogaWRVc2VyTG9nZ2VkLCBpZFJlY2VpdmVyOiBpZENvbnRhY3R9LFxyXG4gICAgICAgICAgIHtpZFNlbmRlcjogaWRDb250YWN0LCBpZFJlY2VpdmVyOiBpZFVzZXJMb2dnZWR9XHJcbiAgICAgICBdXHJcbiAgIH0se1xyXG4gICAgICAgbGltaXQ6IDIwLFxyXG4gICAgICAgc29ydDoge1xyXG4gICAgICAgICAgIGRhdGU6IC0xXHJcbiAgICAgICB9XHJcbiAgIH0pO1xyXG59KTtcclxuXHJcbm1lc3NhZ2VzUHVibGljYXRpb24udXNlKG5ldyBQZXJtaXNzaW9uTWlkZGxld2FyZShbUGVybWlzc2lvbnMuQ0hBVC5MSVNULlZBTFVFXSkpOyIsImltcG9ydCBQZXJtaXNzaW9ucyBmcm9tICcuLi8uLi9zdGFydHVwL3NlcnZlci9QZXJtaXNzaW9ucyc7XHJcbmltcG9ydCB7IFJlc3BvbnNlTWVzc2FnZSB9IGZyb20gJy4uLy4uL3N0YXJ0dXAvc2VydmVyL3V0aWxpdGllcy9SZXNwb25zZU1lc3NhZ2UnO1xyXG5pbXBvcnQgQXV0aEd1YXJkIGZyb20gJy4uLy4uL21pZGRsZXdhcmVzL0F1dGhHdWFyZCc7XHJcbmltcG9ydCB7IGNoZWNrIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcclxuaW1wb3J0IHsgUHJvZmlsZSB9IGZyb20gJy4uL1Byb2ZpbGVzL1Byb2ZpbGUnO1xyXG5cclxubmV3IFZhbGlkYXRlZE1ldGhvZCh7XHJcbiAgICBuYW1lOiAncGVybWlzc2lvbnMubGlzdCcsXHJcbiAgICBtaXhpbnM6IFtNZXRob2RIb29rc10sXHJcbiAgICBwZXJtaXNzaW9uczogW1Blcm1pc3Npb25zLlBFUk1JU1NJT05TLkxJU1QuVkFMVUVdLFxyXG4gICAgYmVmb3JlSG9va3M6IFtBdXRoR3VhcmQuY2hlY2tQZXJtaXNzaW9uXSxcclxuICAgIHZhbGlkYXRlOm51bGwsXHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2VNZXNzYWdlID0gbmV3IFJlc3BvbnNlTWVzc2FnZSgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBlcm1pc3Npb25zID0gTWV0ZW9yLnJvbGVzLmZpbmQoKS5mZXRjaCgpO1xyXG4gICAgICAgICAgICByZXNwb25zZU1lc3NhZ2UuY3JlYXRlKCdQZXJtaXNvcyBkaXNwb25pYmxlcyBkZWwgc2lzdGVtYScsIG51bGwsIHBlcm1pc3Npb25zKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdwZXJtaXNzaW9ucy5saXN0OiAnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzUwMCcsICdPY3VycmlvIHVuIGVycm9yIGFsIG9idGVuZXIgbG9zIHBlcm1pc29zJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZU1lc3NhZ2U7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubmV3IFZhbGlkYXRlZE1ldGhvZCh7XHJcbiAgICBuYW1lOiAncGVybWlzc2lvbnMubGlzdEJ5SWRQcm9maWxlJyxcclxuICAgIG1peGluczogW01ldGhvZEhvb2tzXSxcclxuICAgIHBlcm1pc3Npb25zOiBbUGVybWlzc2lvbnMuUEVSTUlTU0lPTlMuTElTVC5WQUxVRV0sXHJcbiAgICBiZWZvcmVIb29rczogW0F1dGhHdWFyZC5jaGVja1Blcm1pc3Npb25dLFxyXG4gICAgdmFsaWRhdGUoeyBpZFByb2ZpbGUgfSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNoZWNrKGlkUHJvZmlsZSwgU3RyaW5nKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdwZXJtaXNzaW9ucy5saXN0QnlJZFByb2ZpbGU6ICcsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNDAzJywgJ0xhIGluZm9ybWFjaW9uIGludHJvZHVjaWRhIGVzIHZhbGlkYScpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBydW4oeyBpZFByb2ZpbGUgfSkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG5ldyBSZXNwb25zZU1lc3NhZ2UoKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9maWxlID0gUHJvZmlsZS5maW5kT25lKGlkUHJvZmlsZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBlcm1pc3Npb25zID0gTWV0ZW9yLnJvbGVzLmZpbmQoeyBfaWQ6IHskbmluOiBwcm9maWxlLnBlcm1pc3Npb25zfSB9KS5mZXRjaCgpO1xyXG4gICAgICAgICAgICByZXNwb25zZU1lc3NhZ2UuY3JlYXRlKCdQZXJtaXNvcyBhc29jaWFkb3MgYWwgcGVyZmlsLicsIG51bGwsIHBlcm1pc3Npb25zKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdwZXJtaXNzaW9ucy5saXN0QnlJZFByb2ZpbGU6ICcsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNTAwJywgJ09jdXJyaW8gdW4gZXJyb3IgYWwgb2J0ZW5lciBsb3MgcGVybWlzb3MgZGVsIHBlcmZpbCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2VNZXNzYWdlO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ3Blcm1pc3Npb25zLmxpc3RPdGhlckZvcklkUHJvZmlsZScsXHJcbiAgICBtaXhpbnM6IFtNZXRob2RIb29rc10sXHJcbiAgICBwZXJtaXNzaW9uczogW1Blcm1pc3Npb25zLlBFUk1JU1NJT05TLkxJU1QuVkFMVUVdLFxyXG4gICAgYmVmb3JlSG9va3M6IFtBdXRoR3VhcmQuY2hlY2tQZXJtaXNzaW9uXSxcclxuICAgIHZhbGlkYXRlKHsgaWRQcm9maWxlIH0pIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjaGVjayhpZFByb2ZpbGUsIFN0cmluZyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncGVybWlzc2lvbnMubGlzdE90aGVyRm9ySWRQcm9maWxlOiAnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsICdMYSBpbmZvcm1hY2lvbiBpbnRyb2R1Y2lkYSBubyBlcyB2YWxpZGEnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcnVuKHsgaWRQcm9maWxlIH0pIHtcclxuICAgICAgICBjb25zdCByZXNwb25zZU1lc3NhZ2UgPSBuZXcgUmVzcG9uc2VNZXNzYWdlKCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcHJvZmlsZSA9IFByb2ZpbGUuZmluZE9uZShpZFByb2ZpbGUpO1xyXG4gICAgICAgICAgICBjb25zdCBwZXJtaXNzaW9ucyA9IE1ldGVvci5yb2xlcy5maW5kKHsgX2lkOiB7JG5vdDogeyRuaW46IHByb2ZpbGUucGVybWlzc2lvbnN9IH0gfSkuZmV0Y2goKTtcclxuICAgICAgICAgICAgcmVzcG9uc2VNZXNzYWdlLmNyZWF0ZSgnUGVybWlzb3Mgbm8gYXNvY2lhZG9zIGFsIHBlcmZpbC4nLCBudWxsLCBwZXJtaXNzaW9ucyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncGVybWlzc2lvbnMubGlzdE90aGVyRm9ySWRQcm9maWxlOiAnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzUwMCcsICdPY3VycmlvIHVuIGVycm9yIGFsIG9idGVuZXIgbG9zIHBlcm1pc29zIG5vIGFzb2NpYWRvcyBhbCBwZXJmaWwnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlTWVzc2FnZTtcclxuICAgIH1cclxufSk7XHJcblxyXG5uZXcgVmFsaWRhdGVkTWV0aG9kKHtcclxuICAgIG5hbWU6ICdwZXJtaXNzaW9uLmNoZWNrJyxcclxuICAgIG1peGluczogW01ldGhvZEhvb2tzXSxcclxuICAgIGJlZm9yZUhvb2tzOiBbQXV0aEd1YXJkLmlzVXNlckxvZ2dlZF0sXHJcbiAgICB2YWxpZGF0ZSh7IHBlcm1pc3Npb24gfSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNoZWNrKCBwZXJtaXNzaW9uLCBTdHJpbmcpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3Blcm1pc3Npb25zLmxpc3RPdGhlckZvcklkUHJvZmlsZTogJywgZXJyb3IpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnTGEgaW5mb3JtYWNpb24gaW50cm9kdWNpZGEgbm8gZXMgdmFsaWRhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJ1bih7IHBlcm1pc3Npb24gfSkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG5ldyBSZXNwb25zZU1lc3NhZ2UoKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBzY29wZSA9IFJvbGVzLmdldFNjb3Blc0ZvclVzZXIodGhpcy51c2VySWQpWzBdO1xyXG4gICAgICAgICAgICBjb25zdCBoYXNQZXJtaXNzaW9uID0gUm9sZXMudXNlcklzSW5Sb2xlKHRoaXMudXNlcklkLCBwZXJtaXNzaW9uLCBzY29wZSk7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlTWVzc2FnZS5jcmVhdGUoYEVsIHVzdWFyaW8gJHsgaGFzUGVybWlzc2lvbiA/ICdzaScgOiAnbm8nIH0gdGllbmUgZWwgcGVybWlzb2AsIG51bGwsIHtoYXNQZXJtaXNzaW9ufSApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3Blcm1pc3Npb25zLmNoZWNrOiAnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzUwMCcsICdPY3VycmlvIHVuIGVycm9yIGFsIHZlcmlmaWNhciBlbCBwZXJtaXNvJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZU1lc3NhZ2U7XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJNZXRlb3IucHVibGlzaCgncm9sZXMnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBNZXRlb3Iucm9sZUFzc2lnbm1lbnQuZmluZCh7ICd1c2VyLl9pZCcgOiB0aGlzLnVzZXJJZCB9KTtcclxufSk7IiwiaW1wb3J0IHtNb25nb30gZnJvbSAnbWV0ZW9yL21vbmdvJztcclxuXHJcbmV4cG9ydCBjb25zdCBQcm9maWxlID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3Byb2ZpbGVzJyk7IiwiaW1wb3J0IFBlcm1pc3Npb25zLCB7cGVybWlzc2lvbnNBcnJheX0gZnJvbSBcIi4uLy4uL3N0YXJ0dXAvc2VydmVyL1Blcm1pc3Npb25zXCJcclxuaW1wb3J0IHsgUHJvZmlsZSB9IGZyb20gXCIuL1Byb2ZpbGVcIjtcclxuXHJcblByb2ZpbGUucmF3Q29sbGVjdGlvbigpLmNyZWF0ZUluZGV4KHsnbmFtZSc6IDF9LCB7dW5pcXVlOiB0cnVlfSk7XHJcblxyXG5leHBvcnQgY29uc3QgU3RhdGljUHJvZmlsZXMgPSB7XHJcbiAgICBhZG1pbjoge1xyXG4gICAgICAgIG5hbWU6ICdhZG1pbicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdBZG1pbmlzdHJhZG9yJyxcclxuICAgICAgICBwZXJtaXNzaW9uczogcGVybWlzc2lvbnNBcnJheS5tYXAocD0+cC5WQUxVRSlcclxuICAgIH1cclxufTtcclxuXHJcbmlmIChNZXRlb3IuaXNEZXZlbG9wbWVudCkge1xyXG4gICAgaWYgKE1ldGVvci5zZXR0aW5ncy5wcml2YXRlICYmIE1ldGVvci5zZXR0aW5ncy5wcml2YXRlLlJFRlJFU0hfU1RBVElDX1BST0ZJTEVTKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0aW5nIHN0YXRpYyBwcm9maWxlcy4gLiAuJyk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoU3RhdGljUHJvZmlsZXMpLmZvckVhY2goc3RhdGljUHJvZmlsZU5hbWUgPT4ge1xyXG4gICAgICAgICAgICBQcm9maWxlLnVwc2VydCh7bmFtZTogU3RhdGljUHJvZmlsZXNbc3RhdGljUHJvZmlsZU5hbWVdLm5hbWV9LCB7XHJcbiAgICAgICAgICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFN0YXRpY1Byb2ZpbGVzW3N0YXRpY1Byb2ZpbGVOYW1lXS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uczogU3RhdGljUHJvZmlsZXNbc3RhdGljUHJvZmlsZU5hbWVdLnBlcm1pc3Npb25zLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgTWV0ZW9yLnVzZXJzLmZpbmQoeyAncHJvZmlsZS5wcm9maWxlJzogU3RhdGljUHJvZmlsZXNbc3RhdGljUHJvZmlsZU5hbWVdLm5hbWV9KS5mZXRjaCgpLmZvckVhY2godXNlciA9PiB7XHJcbiAgICAgICAgICAgICAgICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQucmVtb3ZlKHsndXNlci5faWQnOiB1c2VyLl9pZH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKFN0YXRpY1Byb2ZpbGVzW3N0YXRpY1Byb2ZpbGVOYW1lXS5wZXJtaXNzaW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgUm9sZXMuc2V0VXNlclJvbGVzKHVzZXIuX2lkLCBTdGF0aWNQcm9maWxlc1tzdGF0aWNQcm9maWxlTmFtZV0ucGVybWlzc2lvbnMsIFN0YXRpY1Byb2ZpbGVzW3N0YXRpY1Byb2ZpbGVOYW1lXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTsiLCJpbXBvcnQge2NoZWNrLCBNYXRjaH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcclxuaW1wb3J0IEF1dGhHdWFyZCBmcm9tICcuLi8uLi9taWRkbGV3YXJlcy9BdXRoR3VhcmQnO1xyXG5pbXBvcnQgUGVybWlzc2lvbnMgZnJvbSAnLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvUGVybWlzc2lvbnMnO1xyXG5pbXBvcnQgeyBSZXNwb25zZU1lc3NhZ2UgfSBmcm9tICcuLi8uLi9zdGFydHVwL3NlcnZlci91dGlsaXRpZXMvUmVzcG9uc2VNZXNzYWdlJztcclxuaW1wb3J0IHtQcm9maWxlfSBmcm9tICcuL1Byb2ZpbGUnO1xyXG5pbXBvcnQgUHJvZmlsZXNTZXJ2IGZyb20gJy4vUHJvZmlsZXNTZXJ2JztcclxuXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ3Byb2ZpbGUuc2F2ZScsXHJcbiAgICBtaXhpbnM6IFtNZXRob2RIb29rc10sXHJcbiAgICBwZXJtaXNzaW9uczogW1Blcm1pc3Npb25zLlBST0ZJTEVTLkNSRUFURS5WQUxVRSwgUGVybWlzc2lvbnMuUFJPRklMRVMuVVBEQVRFLlZBTFVFXSxcclxuICAgIGJlZm9yZUhvb2tzOiBbQXV0aEd1YXJkLmNoZWNrUGVybWlzc2lvbl0sXHJcbiAgICB2YWxpZGF0ZShwcm9maWxlKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY2hlY2socHJvZmlsZSwge1xyXG4gICAgICAgICAgICAgICAgX2lkOiBNYXRjaC5PbmVPZihTdHJpbmcsIG51bGwpLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogU3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFN0cmluZyxcclxuICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiBbU3RyaW5nXVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdwcm9maWxlLnNhdmUnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsICdMYSBpbmZvcm1hY2lvbiBubyBlcyB2YWxpZGEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvZmlsZXNTZXJ2LnZhbGlkYXRlTmFtZShwcm9maWxlLm5hbWUsIHByb2ZpbGUuX2lkKTtcclxuICAgIH0sXHJcbiAgICBydW4ocHJvZmlsZSkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG5ldyBSZXNwb25zZU1lc3NhZ2UoKTtcclxuICAgICAgICBpZiAocHJvZmlsZS5faWQgIT09IG51bGwpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBVUERBVEUgUFJPRklMRVxyXG4gICAgICAgICAgICBjb25zdCBvbGRQcm9maWxlID0gUHJvZmlsZS5maW5kT25lKHByb2ZpbGUuX2lkKTtcclxuICAgICAgICAgICAgY29uc3QgdXNlcnMgPSBQcm9maWxlc1NlcnYuZ2V0VXNlcnNCeVByb2ZpbGUocHJvZmlsZS5faWQpO1xyXG4gICAgICAgICAgICBQcm9maWxlLnVwZGF0ZShwcm9maWxlLl9pZCwge1xyXG4gICAgICAgICAgICAgICAgJHNldDoge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHByb2ZpbGUubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogcHJvZmlsZS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uczogcHJvZmlsZS5wZXJtaXNzaW9uc1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKG9sZFByb2ZpbGUubmFtZSAhPT0gcHJvZmlsZS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBNZXRlb3IudXNlcnMudXBkYXRlKHsncHJvZmlsZS5wcm9maWxlJzogb2xkUHJvZmlsZS5uYW1lfSwge1xyXG4gICAgICAgICAgICAgICAgICAgICRzZXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3Byb2ZpbGUucHJvZmlsZSc6IHByb2ZpbGUubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0seyBtdWx0aTp0cnVlIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFByb2ZpbGVzU2Vydi51cGRhdGVQcm9maWxlVXNlcnModXNlcnMsIHByb2ZpbGUpO1xyXG4gICAgICAgICAgICByZXNwb25zZU1lc3NhZ2UuY3JlYXRlKCdTZSBhY3R1YWxpem8gZWwgcGVyZmlsIGV4aXRvc2FtZW50ZScpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3Byb2ZpbGUuc2F2ZScsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNTAwJywgJ09jdXJyaW8gdW4gZXJyb3IgYWwgYWN0dWFsaXphciBlbCBwZXJmaWwnKTtcclxuICAgICAgICB9ICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIENSRUFURSBQUk9GSUxFXHJcbiAgICAgICAgICAgICAgICBQcm9maWxlLmluc2VydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJvZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBwcm9maWxlLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiBwcm9maWxlLnBlcm1pc3Npb25zXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlTWVzc2FnZS5jcmVhdGUoJ1NlIGNyZW8gZWwgcGVyZmlsIGV4aXRvc2FtZW50ZScpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigncHJvZmlsZS5zYXZlJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNTAwJywgJ09jdXJyaW8gdW4gZXJyb3IgYWwgY3JlYXIgZWwgbnVldm8gcGVyZmlsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlTWVzc2FnZTtcclxuICAgIH1cclxufSk7XHJcblxyXG5uZXcgVmFsaWRhdGVkTWV0aG9kKCB7XHJcbiAgICBuYW1lOiAncHJvZmlsZS5kZWxldGUnLFxyXG4gICAgbWl4aW5zOiBbTWV0aG9kSG9va3NdLFxyXG4gICAgcGVybWlzc2lvbnM6IFtQZXJtaXNzaW9ucy5QUk9GSUxFUy5ERUxFVEUuVkFMVUVdLFxyXG4gICAgYmVmb3JlSG9va3M6IFtBdXRoR3VhcmQuY2hlY2tQZXJtaXNzaW9uXSxcclxuICAgIHZhbGlkYXRlKHsgaWRQcm9maWxlIH0pIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjaGVjayhpZFByb2ZpbGUsIFN0cmluZyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncHJvZmlsZS5kZWxldGUnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsICdMYSBpbmZvcm1hY2lvbiBpbnRyb2R1Y2lkYSBubyBlcyB2YWxpZGEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdXNlcnMgPSBQcm9maWxlc1NlcnYuZ2V0VXNlcnNCeVByb2ZpbGUoaWRQcm9maWxlKTtcclxuICAgICAgICBpZiAodXNlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnTm8gc2UgcHVlZGUgZWxpbWluYXIgcGVyZmlsLicsICdIYXkgdXN1YXJpb3MgdXNhbmRvIGVzdGUgcGVyZmlsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJ1bih7IGlkUHJvZmlsZSB9KSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2VNZXNzYWdlID0gbmV3IFJlc3BvbnNlTWVzc2FnZSgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIFByb2ZpbGUucmVtb3ZlKGlkUHJvZmlsZSk7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlTWVzc2FnZS5jcmVhdGUoJ1BlcmZpbCBlbGltaW5hZG8gZXhpdG9zYW1lbnRlJyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncHJvZmlsZS5kZWxldGUnLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsICdMYSBpbmZvcm1hY2lvbiBpbnRyb2R1Y2lkYSBubyBlcyB2YWxpZGEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlTWVzc2FnZTtcclxuICAgIH1cclxufSk7IiwiaW1wb3J0IHsgUGVybWlzc2lvbk1pZGRsZXdhcmUgfSBmcm9tIFwiLi4vLi4vbWlkZGxld2FyZXMvUGVybWlzc2lvbnNNaWRkbGV3YXJlXCI7XHJcbmltcG9ydCBQZXJtaXNzaW9ucyBmcm9tIFwiLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvUGVybWlzc2lvbnNcIjtcclxuaW1wb3J0IHsgUHJvZmlsZSB9IGZyb20gXCIuL1Byb2ZpbGVcIlxyXG5pbXBvcnQgUHJvZmlsZXNTZXJ2IGZyb20gXCIuL1Byb2ZpbGVzU2VydlwiO1xyXG5cclxuY29uc3Qgbm9TdGF0aWNQcm9maWxlc1B1YmxpY2F0aW9uID0gbmV3IFB1Ymxpc2hFbmRwb2ludCgncHJvZmlsZS5saXN0Tm90U3RhdGljUHJvZmlsZXMnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBQcm9maWxlLmZpbmQoe25hbWU6IHskbmluOiBQcm9maWxlc1NlcnYuZ2V0U3RhdGljUHJvZmlsZU5hbWUoKSB9fSk7XHJcbn0pOyBcclxuXHJcbmNvbnN0IHByb2ZpbGVzUHVibGljYXRpb24gPSBuZXcgUHVibGlzaEVuZHBvaW50KCdwcm9maWxlLmxpc3RBbGwnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBQcm9maWxlLmZpbmQoKTtcclxufSk7IFxyXG5cclxucHJvZmlsZXNQdWJsaWNhdGlvbi51c2UobmV3IFBlcm1pc3Npb25NaWRkbGV3YXJlKFtQZXJtaXNzaW9ucy5QUk9GSUxFUy5MSVNULlZBTFVFXSkpO1xyXG5ub1N0YXRpY1Byb2ZpbGVzUHVibGljYXRpb24udXNlKG5ldyBQZXJtaXNzaW9uTWlkZGxld2FyZShbUGVybWlzc2lvbnMuUFJPRklMRVMuTElTVC5WQUxVRV0pKTsiLCJpbXBvcnQgeyBQcm9maWxlIH0gZnJvbSBcIi4vUHJvZmlsZVwiXHJcbmltcG9ydCB7IFN0YXRpY1Byb2ZpbGVzIH0gZnJvbSBcIi4vUHJvZmlsZVNlZWRlclwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgdmFsaWRhdGVOYW1lKG5hbWUsIGlkUHJvZmlsZSl7XHJcbiAgICAgICAgY29uc3QgZXhpc3ROYW1lID0gUHJvZmlsZS5maW5kT25lKHtuYW1lfSk7XHJcbiAgICAgICAgaWYgKGlkUHJvZmlsZSkge1xyXG4gICAgICAgICAgICBjb25zdCBvbGRQcm9maWxlID0gUHJvZmlsZS5maW5kT25lKGlkUHJvZmlsZSk7XHJcbiAgICAgICAgICAgIGlmIChvbGRQcm9maWxlLm5hbWUgIT09IG5hbWUgJiYgZXhpc3ROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCBcIkVsIG51ZXZvIG5vbWJyZSBkZSBwZXJmaWwgeWEgc2UgZW5jdWVudHJhIGVuIHVzb1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoZXhpc3ROYW1lKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsIFwiRWwgbm9tYnJlIGRlIHBlcmZpbCB5YSBzZSBlbmN1ZW50cmEgZW4gdXNvXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBnZXRVc2Vyc0J5UHJvZmlsZShpZFByb2ZpbGUpIHtcclxuICAgICAgICBjb25zdCBwcm9maWxlID0gUHJvZmlsZS5maW5kT25lKGlkUHJvZmlsZSk7XHJcbiAgICAgICAgcmV0dXJuIE1ldGVvci51c2Vycy5maW5kKHsncHJvZmlsZS5wcm9maWxlJzogcHJvZmlsZS5uYW1lfSkuZmV0Y2goKTtcclxuICAgIH0sXHJcbiAgICBzZXRVc2VyUm9sZXMoaWRVc2VyLCBwcm9maWxlTmFtZSkge1xyXG4gICAgICAgIGNvbnN0IHBlcm1pc3Npb25zID0gUHJvZmlsZS5maW5kT25lKHtuYW1lOiBwcm9maWxlTmFtZX0pLnBlcm1pc3Npb25zO1xyXG4gICAgICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC5yZW1vdmUoeyd1c2VyLl9pZCc6IGlkVXNlcn0pO1xyXG4gICAgICAgIFJvbGVzLnNldFVzZXJSb2xlcyhpZFVzZXIsIHBlcm1pc3Npb25zLCBwcm9maWxlTmFtZSk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlUHJvZmlsZVVzZXJzKHVzZXJzLCBwcm9maWxlKSB7XHJcbiAgICAgICAgdXNlcnMuZm9yRWFjaCh1c2VyID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXRVc2VyUm9sZXModXNlci5faWQsIHByb2ZpbGUubmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0U3RhdGljUHJvZmlsZU5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKFN0YXRpY1Byb2ZpbGVzKS5tYXAoc3RhdGljUHJvZmlsZU5hbWUgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gU3RhdGljUHJvZmlsZXNbc3RhdGljUHJvZmlsZU5hbWVdLm5hbWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07IiwiaW1wb3J0IFBlcm1pc3Npb25zIGZyb20gJy4uLy4uL3N0YXJ0dXAvc2VydmVyL1Blcm1pc3Npb25zJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICAgIHtcclxuICAgICAgICB0aXRsZTogJ0luaWNpbycsXHJcbiAgICAgICAgcGVybWlzc2lvbjogbnVsbCxcclxuICAgICAgICByb3V0ZU5hbWU6ICdob21lJ1xyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICB0aXRsZTogJ1VzdWFyaW9zJyxcclxuICAgICAgICBwZXJtaXNzaW9uOiBQZXJtaXNzaW9ucy5VU0VSUy5MSVNULlZBTFVFLFxyXG4gICAgICAgIHJvdXRlTmFtZTogJ2hvbWUudXNlcnMnXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIHRpdGxlOiAnUGVyZmlsZXMnLFxyXG4gICAgICAgIHBlcm1pc3Npb246IFBlcm1pc3Npb25zLlBST0ZJTEVTLkxJU1QuVkFMVUUsXHJcbiAgICAgICAgcm91dGVOYW1lOiAnaG9tZS5wcm9maWxlcydcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgdGl0bGU6ICdDaGF0JyxcclxuICAgICAgICBwZXJtaXNzaW9uOiBQZXJtaXNzaW9ucy5DSEFULkxJU1QuVkFMVUUsXHJcbiAgICAgICAgcm91dGVOYW1lOiAnaG9tZS5jaGF0J1xyXG4gICAgfVxyXG5cclxuXTsiLCJpbXBvcnQgU3lzdGVtT3B0aW9ucyBmcm9tIFwiLi9TeXN0ZW1PcHRpb25zXCI7XHJcbmltcG9ydCB7IFJlc3BvbnNlTWVzc2FnZSB9IGZyb20gXCIuLi8uLi9zdGFydHVwL3NlcnZlci91dGlsaXRpZXMvUmVzcG9uc2VNZXNzYWdlXCI7XHJcbmltcG9ydCBBdXRoR3VhcmQgZnJvbSBcIi4uLy4uL21pZGRsZXdhcmVzL0F1dGhHdWFyZFwiO1xyXG5cclxubmV3IFZhbGlkYXRlZE1ldGhvZCh7XHJcbiAgICBuYW1lOiAndXNlci5nZXRTeXN0ZW1PcHRpb25zJyxcclxuICAgIG1peGluczogW01ldGhvZEhvb2tzXSxcclxuICAgIGJlZm9yZUhvb2tzOiBbQXV0aEd1YXJkLmlzVXNlckxvZ2dlZF0sXHJcbiAgICB2YWxpZGF0ZTogbnVsbCxcclxuICAgIHJ1bigpe1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG5ldyBSZXNwb25zZU1lc3NhZ2UoKTtcclxuICAgICAgICBjb25zdCB1c2VyTG9nZ2VkID0gTWV0ZW9yLnVzZXIoKTtcclxuICAgICAgICBjb25zdCB1c2VyUm9sZXMgPSBSb2xlcy5nZXRSb2xlc0ZvclVzZXIodXNlckxvZ2dlZC5faWQsIHVzZXJMb2dnZWQucHJvZmlsZS5wcm9maWxlKTtcclxuICAgICAgICBjb25zdCBvcHRpb25zT2ZVc2VyID0gU3lzdGVtT3B0aW9ucy5yZWR1Y2UoKCBhY2N1bXVsYXRvciwgc3lzdGVtT3B0aW9uICkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXN5c3RlbU9wdGlvbi5wZXJtaXNzaW9uIHx8ICEhdXNlclJvbGVzLmZpbmQocm9sZSA9PiByb2xlID09PSBzeXN0ZW1PcHRpb24ucGVybWlzc2lvbikpIHtcclxuICAgICAgICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2goc3lzdGVtT3B0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYWNjdW11bGF0b3I7XHJcbiAgICAgICAgfSwgW10pXHJcbiAgICAgICAgcmVzcG9uc2VNZXNzYWdlLmNyZWF0ZSgnT3BjaW9uZXMgZGVsIHNpc3RlbWEgZGUgdXN1YXJpby4nLCBudWxsLCBvcHRpb25zT2ZVc2VyKTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2VNZXNzYWdlO1xyXG4gICAgfVxyXG59KSIsImltcG9ydCB7IFVzZXIgfSBmcm9tICdtZXRlb3Ivc29jaWFsaXplOnVzZXItbW9kZWwnO1xyXG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gXCJzaW1wbC1zY2hlbWFcIjtcclxuXHJcbk1ldGVvci51c2Vycy5yYXdDb2xsZWN0aW9uKCkuY3JlYXRlSW5kZXgoeyAncHJvZmlsZS5wcm9maWxlJzogMSB9KTtcclxuXHJcbmNvbnN0IFVzZXJQcm9maWxlU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgICBwcm9maWxlOiB7XHJcbiAgICAgICAgdHlwZTogT2JqZWN0LFxyXG4gICAgICAgIG9wdGlvbmFsOiBmYWxzZSxcclxuICAgICAgICBibGFja2JveDogdHJ1ZVxyXG4gICAgfVxyXG59KTtcclxuXHJcblVzZXIuYXR0YWNoU2NoZW1hKCBVc2VyUHJvZmlsZVNjaGVtYSApOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnbWV0ZW9yL3NvY2lhbGl6ZTp1c2VyLW1vZGVsJztcclxuaW1wb3J0IHsgVXNlclByZXNlbmNlIH0gZnJvbSAnbWV0ZW9yL3NvY2lhbGl6ZTp1c2VyLXByZXNlbmNlJztcclxuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xyXG5cclxuLy8gU2NoZW1hIGZvciB0aGUgZmllbGRzIHdoZXJlIHdlIHdpbGwgc3RvcmUgdGhlIHN0YXR1cyBkYXRhXHJcbmNvbnN0IFN0YXR1c1NjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgc3RhdHVzOiBPYmplY3QsXHJcbiAgICAnc3RhdHVzLm9ubGluZSc6IHt0eXBlOiBCb29sZWFufSxcclxuICAgICdzdGF0dXMuaWRsZSc6IHt0eXBlOiBCb29sZWFuLCBvcHRpb25hbDogdHJ1ZX0sXHJcbiAgICAnc3RhdHVzLmxhc3RMb2dpbic6IHt0eXBlOiBPYmplY3QsIG9wdGlvbmFsOiB0cnVlLCBibGFja2JveDogdHJ1ZX1cclxufSk7XHJcblxyXG4vLyBBZGQgdGhlIHNjaGVtYSB0byB0aGUgZXhpc3Rpbmcgc2NoZW1hIGN1cnJlbnRseSBhdHRhY2hlZCB0byB0aGUgVXNlciBtb2RlbFxyXG5Vc2VyLmF0dGFjaFNjaGVtYShTdGF0dXNTY2hlbWEpO1xyXG5cclxuLy8gSWYgYHNlc3Npb25JZHNgIGlzIHVuZGVmaW5lZCB0aGlzIHNpZ25pZmllcyB3ZSBuZWVkIGEgZnJlc2ggc3RhcnQuXHJcbi8vIFdoZW4gYSBmdWxsIGNsZWFudXAgaXMgbmVjZXNzYXJ5IHdlIHdpbGwgdW5zZXQgdGhlIHN0YXR1cyBmaWVsZCB0byBzaG93IGFsbCB1c2VycyBhcyBvZmZsaW5lXHJcblVzZXJQcmVzZW5jZS5vbkNsZWFudXAoZnVuY3Rpb24gb25DbGVhbnVwKHNlc3Npb25JZHMpIHtcclxuICAgIGlmICghc2Vzc2lvbklkcykge1xyXG4gICAgICAgIE1ldGVvci51c2Vycy51cGRhdGUoe30sIHsgJHNldDogeydzdGF0dXMub25saW5lJzogZmFsc2V9LCAkdW5zZXQ6IHsgJ3N0YXR1cy5pZGxlJzogdHJ1ZSB9IH0sIHsgbXVsdGk6IHRydWUgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8gV2hlbiBhIHVzZXIgY29tZXMgb25saW5lIHdlIHNldCB0aGVpciBzdGF0dXMgdG8gb25saW5lIGFuZCBzZXQgdGhlIGxhc3RPbmxpbmUgZmllbGQgdG8gdGhlIGN1cnJlbnQgdGltZVxyXG5Vc2VyUHJlc2VuY2Uub25Vc2VyT25saW5lKGZ1bmN0aW9uIG9uVXNlck9ubGluZSh1c2VySWQsIGNvbm5lY3Rpb24pIHtcclxuICAgIGlmIChjb25uZWN0aW9uKSB7XHJcbiAgICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh1c2VySWQsIHsgXHJcbiAgICAgICAgICAgICRzZXQ6IHsgXHJcbiAgICAgICAgICAgICAgICAnc3RhdHVzLm9ubGluZSc6IHRydWUsICdzdGF0dXMuaWRsZSc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgJ3N0YXR1cy5sYXN0TG9naW4nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBpcEFkZHI6IGNvbm5lY3Rpb24uY2xpZW50QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyQWdlbnQ6IGNvbm5lY3Rpb24uaHR0cEhlYWRlcnNbJ3VzZXItYWdlbnQnXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIFdoZW4gYSB1c2VyIGdvZXMgaWRsZSB3ZSdsbCBzZXQgdGhlaXIgc3RhdHVzIHRvIGluZGljYXRlIHRoaXNcclxuVXNlclByZXNlbmNlLm9uVXNlcklkbGUoZnVuY3Rpb24gb25Vc2VySWRsZSh1c2VySWQpIHtcclxuICAgIE1ldGVvci51c2Vycy51cGRhdGUodXNlcklkLCB7ICRzZXQ6IHsgJ3N0YXR1cy5pZGxlJzogdHJ1ZSB9IH0pO1xyXG59KTtcclxuXHJcbi8vIFdoZW4gYSB1c2VyIGdvZXMgb2ZmbGluZSB3ZSdsbCB1bnNldCB0aGVpciBzdGF0dXMgZmllbGQgdG8gaW5kaWNhdGUgb2ZmbGluZSBzdGF0dXNcclxuVXNlclByZXNlbmNlLm9uVXNlck9mZmxpbmUoZnVuY3Rpb24gb25Vc2VyT2ZmbGluZSh1c2VySWQpIHtcclxuICAgIE1ldGVvci51c2Vycy51cGRhdGUodXNlcklkLCB7ICRzZXQ6IHsgJ3N0YXR1cy5vbmxpbmUnOiBmYWxzZSB9LCAkdW5zZXQ6IHsgJ3N0YXR1cy5pZGxlJzogdHJ1ZSB9IH0pO1xyXG59KTtcclxuIiwiaW1wb3J0IHtWYWxpZGF0ZWRNZXRob2R9IGZyb20gJ21ldGVvci9tZGc6dmFsaWRhdGVkLW1ldGhvZCc7XHJcbmltcG9ydCB7Y2hlY2ssIE1hdGNofSBmcm9tICdtZXRlb3IvY2hlY2snO1xyXG5pbXBvcnQgeyBSZXNwb25zZU1lc3NhZ2UgfSBmcm9tICcuLi8uLi9zdGFydHVwL3NlcnZlci91dGlsaXRpZXMvUmVzcG9uc2VNZXNzYWdlJztcclxuaW1wb3J0IFVzZXJzU2VydiBmcm9tICcuL1VzZXJzU2Vydic7XHJcbmltcG9ydCBBdXRoR3VhcmQgZnJvbSAnLi4vLi4vbWlkZGxld2FyZXMvQXV0aEd1YXJkJztcclxuaW1wb3J0IFBlcm1pc3Npb25zIGZyb20gJy4uLy4uL3N0YXJ0dXAvc2VydmVyL1Blcm1pc3Npb25zJztcclxuaW1wb3J0ICcuL1VzZXJQcmVzZW5jZUNvbmZpZyc7XHJcblxyXG5BY2NvdW50cy5vbkNyZWF0ZVVzZXIoKG9wdGlvbnMsIHVzZXIpID0+IHtcclxuICAgIGNvbnN0IGN1c3RvbWl6ZWRVc2VyID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgc3RhdHVzOiB7XHJcbiAgICAgICAgICAgIG9ubGluZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9LCB1c2VyKTtcclxuICAgIGlmIChvcHRpb25zLnByb2ZpbGUpIHtcclxuICAgICAgICBjdXN0b21pemVkVXNlci5wcm9maWxlID0gb3B0aW9ucy5wcm9maWxlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGN1c3RvbWl6ZWRVc2VyO1xyXG59KTtcclxuXHJcbkFjY291bnRzLnZhbGlkYXRlTG9naW5BdHRlbXB0KGxvZ2luQXR0ZW1wdCA9PiB7XHJcbiAgICBpZiAobG9naW5BdHRlbXB0LmFsbG93ZWQpIHtcclxuICAgICAgICBpZiAoIWxvZ2luQXR0ZW1wdC51c2VyLmVtYWlsc1swXS52ZXJpZmllZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnRWwgY29ycmVvIGRlIGxhIGN1ZW50YSBubyBzZSBoYSB2ZXJpZmljYWRvIGF1bi4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbG9naW5Ub2tlbnNPZlVzZXIgPSBsb2dpbkF0dGVtcHQudXNlci5zZXJ2aWNlcy5yZXN1bWU/LmxvZ2luVG9rZW5zIHx8IFtdO1xyXG4gICAgICAgIGlmIChsb2dpblRva2Vuc09mVXNlci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIE1ldGVvci51c2Vycy51cGRhdGUobG9naW5BdHRlbXB0LnVzZXIuX2lkLCB7XHJcbiAgICAgICAgICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3NlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucyc6IFtsb2dpblRva2Vuc09mVXNlci5wb3AoKV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2QgKHtcclxuICAgIG5hbWU6ICd1c2VyLnNhdmUnLFxyXG4gICAgbWl4aW5zOiBbTWV0aG9kSG9va3NdLFxyXG4gICAgcGVybWlzc2lvbnM6IFtQZXJtaXNzaW9ucy5VU0VSUy5DUkVBVEUuVkFMVUUsIFBlcm1pc3Npb25zLlVTRVJTLlVQREFURS5WQUxVRV0sXHJcbiAgICBiZWZvcmVIb29rczogW0F1dGhHdWFyZC5jaGVja1Blcm1pc3Npb25dLFxyXG4gICAgdmFsaWRhdGUgKHt1c2VyfSl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY2hlY2sodXNlciwge1xyXG4gICAgICAgICAgICAgICAgX2lkOiBNYXRjaC5PbmVPZihTdHJpbmcsIG51bGwpLFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IFN0cmluZyxcclxuICAgICAgICAgICAgICAgIGVtYWlsczogW3thZGRyZXNzOiBTdHJpbmcsIHZlcmlmaWVkOiBCb29sZWFufV0sXHJcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZTogU3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBNYXRjaC5PbmVPZihTdHJpbmcsIG51bGwpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3NhdmUudXNlcicsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNDAzJywgJ0xhIGluZm9ybWFjaW9uIGludHJvZHVjaWRhIG5vIGVzIHZhbGlkYScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBVc2Vyc1NlcnYudmFsaWRhdGVFbWFpbCh1c2VyLmVtYWlsc1swXS5hZGRyZXNzLCB1c2VyLl9pZCk7XHJcbiAgICAgICAgVXNlcnNTZXJ2LnZhbGlkYXRlVXNlcm5hbWUodXNlci51c2VybmFtZSwgdXNlci5faWQpO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHJ1biAoe3VzZXIsIHBob3RvRmlsZVVzZXJ9KXtcclxuICAgICAgICBjb25zdCByZXNwb25zZU1lc3NhZ2UgPSBuZXcgUmVzcG9uc2VNZXNzYWdlKCk7XHJcbiAgICAgICAgaWYgKHVzZXIuX2lkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyBVUERBVEUgVVNFUiBcclxuICAgICAgICAgICAgICAgIGF3YWl0IFVzZXJzU2Vydi51cGRhdGVVc2VyKHVzZXIsIHBob3RvRmlsZVVzZXIpO1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VNZXNzYWdlLmNyZWF0ZSgnU2UgYWN0dWFsaXpvIGVsIHVzdWFyaW8gZXhpdG9zYW1lbnRlJyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCd1c2VyLnNhdmUnLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc1MDAnLCAnT2N1cnJpbyB1biBlcnJvciBhbCBhY3R1YWxpemFyIGVsIHVzdWFyaW8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDUkVBVEUgVVNFUlxyXG4gICAgICAgICAgICAgICAgYXdhaXQgVXNlcnNTZXJ2LmNyZWF0ZVVzZXIodXNlciwgcGhvdG9GaWxlVXNlcik7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZU1lc3NhZ2UuY3JlYXRlKCdTZSBoYSBjcmVhZG8gdXN1YXJpbyBleGl0b3NhbWVudGUnKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VzZXIuc2F2ZTogJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNTAwJywgJ09jdXJyacOzIHVuIGVycm9yIGFsIGNyZWFyIHVuIHVzdWFyaW8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2VNZXNzYWdlO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xyXG4gICAgbmFtZTogJ3VzZXIuZGVsZXRlJyxcclxuICAgIG1peGluczogW01ldGhvZEhvb2tzXSxcclxuICAgIHBlcm1pc3Npb25zOiBbUGVybWlzc2lvbnMuVVNFUlMuREVMRVRFLlZBTFVFXSxcclxuICAgIGJlZm9yZUhvb2tzOiBbQXV0aEd1YXJkLmNoZWNrUGVybWlzc2lvbl0sXHJcbiAgICB2YWxpZGF0ZSh7aWRVc2VyfSl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY2hlY2soaWRVc2VyLCBTdHJpbmcpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VzZXIuZGVsZXRlJywgZXJyb3IpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnTGEgaW5mb3JtYWNpb24gaW50cm9kdWNpZGEgbm8gZXMgdmFsaWRhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGFzeW5jIHJ1biAoe2lkVXNlcn0pIHtcclxuICAgICAgICBjb25zdCByZXNwb25zZU1lc3NhZ2UgPSBuZXcgUmVzcG9uc2VNZXNzYWdlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IFVzZXJzU2Vydi5kZWxldGVVc2VyKGlkVXNlcik7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlTWVzc2FnZS5jcmVhdGUoJ1NlIGhhIGVsaW1pbmFkbyBleGl0b3NhbWVudGUgYWwgdXN1YXJpbycpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VzZXIuZGVsZXRlJywgZXJyb3IpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc1MDAnLCAnT2N1cnJpbyB1biBlcnJvciBhbCBlbGltaW5hciB1biB1c3VhcmlvJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZU1lc3NhZ2U7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubmV3IFZhbGlkYXRlZE1ldGhvZCAoe1xyXG4gICAgbmFtZTogJ3VzZXIudXBkYXRlUGVyc29uYWxEYXRhJyxcclxuICAgIG1peGluczogW01ldGhvZEhvb2tzXSxcclxuICAgIGJlZm9yZUhvb2tzOiBbQXV0aEd1YXJkLmlzVXNlckxvZ2dlZF0sXHJcbiAgICB2YWxpZGF0ZSh7dXNlcn0pe1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNoZWNrKHVzZXIsIHtcclxuICAgICAgICAgICAgICAgIF9pZDogTWF0Y2guT25lT2YoU3RyaW5nLCBudWxsKSxcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICBlbWFpbHM6IFt7YWRkcmVzczogU3RyaW5nLCB2ZXJpZmllZDogQm9vbGVhbn1dLFxyXG4gICAgICAgICAgICAgICAgcHJvZmlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGU6IFN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogTWF0Y2guT25lT2YoU3RyaW5nLCBudWxsKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1c2VyLnVwZGF0ZVBlcnNvbmFsRGF0YScsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNDAzJywgJ0xhIGluZm9ybWFjaW9uIGludHJvZHVjaWRhIG5vIGVzIHZhbGlkYScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBVc2Vyc1NlcnYudmFsaWRhdGVFbWFpbCh1c2VyLmVtYWlsc1swXS5hZGRyZXNzLCB1c2VyLl9pZCk7XHJcbiAgICAgICAgVXNlcnNTZXJ2LnZhbGlkYXRlVXNlcm5hbWUodXNlci51c2VybmFtZSwgdXNlci5faWQpO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHJ1bih7dXNlciwgcGhvdG9GaWxlVXNlcn0pe1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlTWVzc2FnZSA9IG5ldyBSZXNwb25zZU1lc3NhZ2UoKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBVUERBVEUgVVNFUiBcclxuICAgICAgICAgICAgYXdhaXQgVXNlcnNTZXJ2LnVwZGF0ZVVzZXIodXNlciwgcGhvdG9GaWxlVXNlcik7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlTWVzc2FnZS5jcmVhdGUoJ1NlIGFjdHVhbGl6byBsYSBpbmZvcm1hY2lvbiBleGl0b3NhbWVudGUnKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCd1c2VyLnVwZGF0ZVBlcnNvbmFsRGF0YScsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNTAwJywgJ09jdXJyaW8gdW4gZXJyb3IgYWwgYWN0dWFsaXphciBsYSBpbmZvcm1hY2lvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2VNZXNzYWdlO1xyXG4gICAgfVxyXG59KTsgIiwiaW1wb3J0IHtNZXRlb3J9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQge1B1Ymxpc2hFbmRwb2ludH0gZnJvbSAnbWV0ZW9yL3BlZXJsaWJyYXJ5Om1pZGRsZXdhcmUnO1xyXG5pbXBvcnQgeyBQZXJtaXNzaW9uTWlkZGxld2FyZSB9IGZyb20gJy4uLy4uL21pZGRsZXdhcmVzL1Blcm1pc3Npb25zTWlkZGxld2FyZSc7XHJcbmltcG9ydCBQZXJtaXNzaW9ucyBmcm9tICcuLi8uLi9zdGFydHVwL3NlcnZlci9QZXJtaXNzaW9ucyc7XHJcblxyXG5jb25zdCB1c2Vyc1B1YmxpY2F0aW9uID0gbmV3IFB1Ymxpc2hFbmRwb2ludCgndXNlci5saXN0JywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gTWV0ZW9yLnVzZXJzLmZpbmQoe30sIHtcclxuICAgICAgICBzb3J0OiB7Y3JlYXRlZEF0OiAtMX1cclxuICAgIH0pO1xyXG59KTtcclxuXHJcbnVzZXJzUHVibGljYXRpb24udXNlKG5ldyBQZXJtaXNzaW9uTWlkZGxld2FyZShbUGVybWlzc2lvbnMuVVNFUlMuTElTVC5WQUxVRV0pKTsiLCJpbXBvcnQgRmlsZU9wZXJhdGlvbnMgZnJvbSAnLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvdXRpbGl0aWVzL0ZpbGVPcGVyYXRpb25zJztcclxuaW1wb3J0IFByb2ZpbGVzU2VydiBmcm9tICcuLi9Qcm9maWxlcy9Qcm9maWxlc1NlcnYnO1xyXG5cclxuY29uc3QgUEFUSF9VU0VSX0ZJTEVTID0gJ3VzZXJzLyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICB2YWxpZGF0ZUVtYWlsKG5ld0VtYWlsLCBpZFVzZXIpe1xyXG4gICAgICAgIGNvbnN0IGV4aXN0RW1haWwgPSBBY2NvdW50cy5maW5kVXNlckJ5RW1haWwobmV3RW1haWwpO1xyXG4gICAgICAgIGlmIChpZFVzZXIpIHtcclxuICAgICAgICAgICAgY29uc3Qgb2xkVXNlciA9IE1ldGVvci51c2Vycy5maW5kT25lKGlkVXNlcik7XHJcbiAgICAgICAgICAgIGlmIChvbGRVc2VyLmVtYWlsc1swXS5hZGRyZXNzICE9PSBuZXdFbWFpbCAmJiBleGlzdEVtYWlsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnRWwgbnVldm8gZW1haWwgeWEgc2UgZW5jdWVudHJhIGVuIHVzbycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChleGlzdEVtYWlsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsICdFbCBudWV2byBlbWFpbCB5YSBzZSBlbmN1ZXRyYSBlbiB1c28nKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdmFsaWRhdGVVc2VybmFtZShuZXdVc2VybmFtZSwgaWRVc2VyKXtcclxuICAgICAgICBjb25zdCBleGlzdFVzZXJuYW1lID0gQWNjb3VudHMuZmluZFVzZXJCeVVzZXJuYW1lKG5ld1VzZXJuYW1lKTtcclxuICAgICAgICBpZiAoaWRVc2VyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9sZFVzZXIgPSBNZXRlb3IudXNlcnMuZmluZE9uZShpZFVzZXIpO1xyXG4gICAgICAgICAgICBpZiAob2xkVXNlci51c2VybmFtZSAhPT0gbmV3VXNlcm5hbWUgJiYgZXhpc3RVc2VybmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignNDAzJywgXCJFbCBudWV2byBub21icmUgZGUgdXN1YXJpbyB5YSBzZSBlbmN1ZW50cmEgZW4gdXNvXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChleGlzdFVzZXJuYW1lKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsIFwiRWwgbm9tYnJlIGRlIHVzdWFyaW8geWEgc2UgZW5jdWVudHJhIGVuIHVzb1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYXN5bmMgY3JlYXRlVXNlcih1c2VyLCBwaG90b0ZpbGVVc2VyKXtcclxuICAgICAgICBjb25zdCBpZFVzZXIgPSBBY2NvdW50cy5jcmVhdGVVc2VyKHtcclxuICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXIudXNlcm5hbWUsXHJcbiAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsc1swXS5hZGRyZXNzLFxyXG4gICAgICAgICAgICBwcm9maWxlOiB1c2VyLnByb2ZpbGVcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgYXZhdGFyU3JjPSBudWxsO1xyXG4gICAgICAgIGlmIChpZFVzZXIpIHtcclxuICAgICAgICAgICAgUHJvZmlsZXNTZXJ2LnNldFVzZXJSb2xlcyhpZFVzZXIsIHVzZXIucHJvZmlsZS5wcm9maWxlKTtcclxuICAgICAgICAgICAgQWNjb3VudHMuc2VuZEVucm9sbG1lbnRFbWFpbChpZFVzZXIsIHVzZXIuZW1haWxzWzBdLmFkZHJlc3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGhvdG9GaWxlVXNlcikge1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLnNhdmVGaWxlRnJvbUJhc2U2NFRvR29vZ2xlU3RvcmFnZShwaG90b0ZpbGVVc2VyLCAnYXZhdGFyJyxcclxuICAgICAgICAgICAgUEFUSF9VU0VSX0ZJTEVTICsgaWRVc2VyKTtcclxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5kYXRhLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzUwMCcsICdFcnJvciBhbCBzdWJpciBsYSBmb3RvJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhdmF0YXJTcmMgPSByZXNwb25zZS5kYXRhLmZpbGVVcmw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZShpZFVzZXIsIHtcclxuICAgICAgICAgICAgJHNldDoge1xyXG4gICAgICAgICAgICAgICAgJ3Byb2ZpbGUucGF0aCc6IGF2YXRhclNyY1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBhc3luYyB1cGRhdGVVc2VyKHVzZXIsIHBob3RvRmlsZVVzZXIpe1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVc2VyID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUodXNlci5faWQpO1xyXG4gICAgICAgIGlmIChjdXJyZW50VXNlci5lbWFpbHNbMF0uYWRkcmVzcyAhPT0gdXNlci5lbWFpbHNbMF0uYWRkcmVzcykge1xyXG4gICAgICAgICAgICBBY2NvdW50cy5yZW1vdmVFbWFpbChjdXJyZW50VXNlci5faWQsIGN1cnJlbnRVc2VyLmVtYWlsc1swXS5hZGRyZXNzKTtcclxuICAgICAgICAgICAgQWNjb3VudHMuYWRkRW1haWwoY3VycmVudFVzZXIuX2lkLCB1c2VyLmVtYWlsc1swXS5hZGRyZXNzKTtcclxuICAgICAgICAgICAgQWNjb3VudHMuc2VuZFZlcmlmaWNhdGlvbkVtYWlsKHVzZXIuX2lkLCB1c2VyLmVtYWlsc1swXS5hZGRyZXNzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1cnJlbnRVc2VyLnVzZXJuYW1lICE9PSB1c2VyLnVzZXJuYW1lKSB7XHJcbiAgICAgICAgICAgIEFjY291bnRzLnNldFVzZXJuYW1lKGN1cnJlbnRVc2VyLl9pZCwgdXNlci51c2VybmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE1ldGVvci51c2Vycy51cGRhdGUodXNlci5faWQsIHtcclxuICAgICAgICAgICAgJHNldDoge1xyXG4gICAgICAgICAgICAgICAgcHJvZmlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGU6IHVzZXIucHJvZmlsZS5wcm9maWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIucHJvZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN1cnJlbnRVc2VyLnByb2ZpbGUucGF0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgUHJvZmlsZXNTZXJ2LnNldFVzZXJSb2xlcyh1c2VyLl9pZCwgdXNlci5wcm9maWxlLnByb2ZpbGUpO1xyXG4gICAgICAgIGlmKHBob3RvRmlsZVVzZXIpIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRVc2VyLnByb2ZpbGUucGF0aCkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgRmlsZU9wZXJhdGlvbnMuZGVsZXRlRmlsZUZyb21Hb29nbGVTdG9yYWdlSWZFeGlzdHMoY3VycmVudFVzZXIucHJvZmlsZS5wYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJzdHJpbmcoY3VycmVudFVzZXIucHJvZmlsZS5wYXRoLmluZGV4T2YoUEFUSF9VU0VSX0ZJTEVTKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuc2F2ZUZpbGVGcm9tQmFzZTY0VG9Hb29nbGVTdG9yYWdlKHBob3RvRmlsZVVzZXIsICdhdmF0YXInLCBQQVRIX1VTRVJfRklMRVMgKyB1c2VyLl9pZCk7XHJcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2UuZGF0YS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnRXJyb3IgYWwgc3ViaXIgbGEgZm90by4nKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIE1ldGVvci51c2Vycy51cGRhdGUodXNlci5faWQsIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2V0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdwcm9maWxlLnBhdGgnOiByZXNwb25zZS5kYXRhLmZpbGVVcmxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGFzeW5jIGRlbGV0ZVVzZXIgKGlkVXNlcikge1xyXG4gICAgICAgIE1ldGVvci51c2Vycy5yZW1vdmUoaWRVc2VyKTtcclxuICAgICAgICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQucmVtb3ZlKHsndXNlci5faWQnOiBpZFVzZXJ9KTtcclxuICAgICAgICBhd2FpdCBGaWxlT3BlcmF0aW9ucy5kZWxldGVGaWxlc09mRm9sZGVyRnJvbUdvb2dsZVN0b3JhZ2UoUEFUSF9VU0VSX0ZJTEVTICsgaWRVc2VyKTtcclxuICAgIH1cclxufTsiLCJjb25zdCBjaGVja1Blcm1pc3Npb24gPSBmdW5jdGlvbiAobWV0aG9kQXJncywgbWV0aG9kT3B0aW9ucykge1xyXG4gICAgY29uc3QgaWRVc2VyID0gdGhpcy51c2VySWQ7XHJcbiAgICBjb25zdCBwZXJtaXNzaW9ucyA9IG1ldGhvZE9wdGlvbnMucGVybWlzc2lvbnM7XHJcbiAgICBsZXQgaGFzUGVybWlzc2lvbiA9IGZhbHNlO1xyXG4gICAgaWYgKGlkVXNlciAhPT0gbnVsbCkge1xyXG4gICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gTWV0ZW9yLnVzZXIoKS5wcm9maWxlLnByb2ZpbGU7XHJcbiAgICAgICAgaGFzUGVybWlzc2lvbiA9IFJvbGVzLnVzZXJJc0luUm9sZShpZFVzZXIsIHBlcm1pc3Npb25zLCBwcm9maWxlTmFtZSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWhhc1Blcm1pc3Npb24pIHtcclxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCc0MDMnLCAnQWNjZXNvIGRlbmVnYWRvJywgXHJcbiAgICAgICAgICAgICAgICAgICAgJ05vIHRpZW5lcyBwZXJtaXNvIHBhcmEgZWplY3V0YXIgZXN0YSBhY2Npb24nKTtcclxuICAgIH1cclxuICAgIHJldHVybiBtZXRob2RBcmdzO1xyXG59O1xyXG5cclxuY29uc3QgaXNVc2VyTG9nZ2VkID0gZnVuY3Rpb24obWV0aG9kQXJncywgbWV0aG9kT3B0aW9ucykge1xyXG4gICAgaWYgKCF0aGlzLnVzZXJJZCkge1xyXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJzQwMycsICdBY2Nlc28gZGVuZWdhZG8nLCBcclxuICAgICAgICAgICAgICAgICAgICAnTm8gdGllbmVzIHBlcm1pc28gcGFyYSBlamVjdXRhciBlc3RhIGFjY2lvbicpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1ldGhvZEFyZ3M7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHsgY2hlY2tQZXJtaXNzaW9uLCBpc1VzZXJMb2dnZWQgfTsiLCJleHBvcnQgY2xhc3MgUGVybWlzc2lvbk1pZGRsZXdhcmUgZXh0ZW5kcyBQdWJsaXNoTWlkZGxld2FyZSB7XHJcbiAgICBjb25zdHJ1Y3RvciAocGVybWlzc2lvbnMpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX3Blcm1pc3Npb25zID0gcGVybWlzc2lvbnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFkZGVkIChwdWJsaXNoLCBjb2xsZWN0aW9uLCBpZCwgZmllbGRzKSB7XHJcbiAgICAgICAgaWYgKHB1Ymxpc2gudXNlcklkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5hZGRlZCguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHVibGlzaC5yZWFkeSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjaGFuZ2UgKHB1Ymxpc2gsIGNvbGxlY3Rpb24sIGlkLCBmaWVsZHMpIHtcclxuICAgICAgICBpZiAodGhpcy5jaGVja1Blcm1pc3Npb24ocHVibGlzaC51c2VySWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5jaGFuZ2VkKC4uLmFyZ3VtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwdWJsaXNoLnJlYWR5KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlbW92ZWQgKHB1Ymxpc2gsIGNvbGxlY3Rpb24sIGlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tQZXJtaXNzaW9uKHB1Ymxpc2gudXNlcklkKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucmVtb3ZlZCguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHVibGlzaC5yZWFkeSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uUmVhZHkgKHB1Ymxpc2gpIHtcclxuICAgICAgICBpZiAocHVibGlzaC51c2VySWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLm9uUmVhZHkoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25TdG9wIChwdWJsaXNoKSB7XHJcbiAgICAgICAgaWYgKHB1Ymxpc2gudXNlcklkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5vblN0b3AoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25FcnJvciAocHVibGlzaCkge1xyXG4gICAgICAgIGlmIChwdWJsaXNoLnVzZXJJZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIub25FcnJvciguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjaGVja1Blcm1pc3Npb24gKGlkVXNlcikge1xyXG4gICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gUm9sZXMuZ2V0U2NvcGVzRm9yVXNlcihpZFVzZXIpWzBdO1xyXG4gICAgICAgIHJldHVybiBSb2xlcy51c2VySXNJblJvbGUoaWRVc2VyLCB0aGlzLl9wZXJtaXNzaW9ucywgcHJvZmlsZU5hbWUpO1xyXG4gICAgfVxyXG59OyIsImltcG9ydCBcIi9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyXCI7XHJcbmltcG9ydCBcIi9pbXBvcnRzL3N0YXJ0dXAvYm90aFwiOyJdfQ==

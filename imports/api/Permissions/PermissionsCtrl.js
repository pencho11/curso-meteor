import Permissions from '../../startup/server/Permissions';
import { ResponseMessage } from '../../startup/server/utilities/ResponseMessage';
import AuthGuard from '../../middlewares/AuthGuard';
import { check } from 'meteor/check';
import { Profile } from '../Profiles/Profile';

new ValidatedMethod({
    name: 'permissions.list',
    mixins: [MethodHooks],
    permissions: [Permissions.PERMISSIONS.LIST.VALUE],
    beforeHooks: [AuthGuard.checkPermission],
    validate:null,
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
    validate({ idProfile }) {
        try {
            check(idProfile, String);
        } catch (error) {
            console.error('permissions.listByIdProfile: ', error);
            throw new Meteor.Error('403', 'La informacion introducida es valida');
        }
    },
    run({ idProfile }) {
        const responseMessage = new ResponseMessage();
        try {
            const profile = Profile.findOne(idProfile);
            const permissions = Meteor.roles.find({ _id: {$nin: profile.permissions} }).fetch();
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
    validate({ idProfile }) {
        try {
            check(idProfile, String);
        } catch (error) {
            console.error('permissions.listOtherForIdProfile: ', error);
            throw new Meteor.Error('403', 'La informacion introducida no es valida');
        }
    },
    run({ idProfile }) {
        const responseMessage = new ResponseMessage();
        try {
            const profile = Profile.findOne(idProfile);
            const permissions = Meteor.roles.find({ _id: {$not: {$nin: profile.permissions} } }).fetch();
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
    validate({ permission }) {
        try {
            check( permission, String);
        } catch (error) {
            console.error('permissions.listOtherForIdProfile: ', error);
            throw new Meteor.Error('403', 'La informacion introducida no es valida');
        }
    },
    run({ permission }) {
        const responseMessage = new ResponseMessage();
        try {
            const scope = Roles.getScopesForUser(this.userId)[0];
            const hasPermission = Roles.userIsInRole(this.userId, permission, scope);
            responseMessage.create(`El usuario ${ hasPermission ? 'si' : 'no' } tiene el permiso`, null, {hasPermission} );
        } catch (error) {
            console.error('permissions.check: ', error);
            throw new Meteor.Error('500', 'Ocurrio un error al verificar el permiso');
        }
        return responseMessage;
    }
});

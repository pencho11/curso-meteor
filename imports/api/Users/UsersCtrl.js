import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {check, Match} from 'meteor/check';
import { ResponseMessage } from '../../startup/server/utilities/ResponseMessage';
import UsersServ from './UsersServ';
import AuthGuard from '../../middlewares/AuthGuard';
import Permissions from '../../startup/server/Permissions';
import './UserPresenceConfig';

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
        if (!loginAttempt.user.emails[0].verified) {
            throw new Meteor.Error('403', 'El correo de la cuenta no se ha verificado aun.');
        }
        const loginTokensOfUser = loginAttempt.user.services.resume?.loginTokens || [];
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

new ValidatedMethod ({
    name: 'user.save',
    mixins: [MethodHooks],
    permissions: [Permissions.USERS.CREATE.VALUE, Permissions.USERS.UPDATE.VALUE],
    beforeHooks: [AuthGuard.checkPermission],
    validate ({user}){
        try {
            check(user, {
                _id: Match.OneOf(String, null),
                username: String,
                emails: [{address: String, verified: Boolean}],
                profile: {
                    profile: String,
                    name: String,
                    path: Match.OneOf(String, null)
                }
            })
        } catch (error) {
            console.log('save.user', error);
            throw new Meteor.Error('403', 'La informacion introducida no es valida');
        }
        UsersServ.validateEmail(user.emails[0].address, user._id);
        UsersServ.validateUsername(user.username, user._id);
    },
    async run ({user, photoFileUser}){
        const responseMessage = new ResponseMessage();
        if (user._id !== null) {
            try {
                // UPDATE USER 
                await UsersServ.updateUser(user, photoFileUser);
                responseMessage.create('Se actualizo el usuario exitosamente');
            } catch (error) {
                console.error('user.save', error);
                throw new Meteor.Error('500', 'Ocurrio un error al actualizar el usuario');
            }
        } else {
            try {
                // CREATE USER
                await UsersServ.createUser(user, photoFileUser);
                responseMessage.create('Se ha creado usuario exitosamente');
            } catch (error) {
                console.error('user.save: ', error);
                throw new Meteor.Error('500', 'Ocurrió un error al crear un usuario');
            }
        }
        return responseMessage;
    }
});

new ValidatedMethod({
    name: 'user.delete',
    mixins: [MethodHooks],
    permissions: [Permissions.USERS.DELETE.VALUE],
    beforeHooks: [AuthGuard.checkPermission],
    validate({idUser}){
        try {
            check(idUser, String);
        } catch (error) {
            console.error('user.delete', error);
            throw new Meteor.Error('403', 'La informacion introducida no es valida');
        }
    },
    async run ({idUser}) {
        const responseMessage = new ResponseMessage;
        try {
            await UsersServ.deleteUser(idUser);
            responseMessage.create('Se ha eliminado exitosamente al usuario');
        } catch (error) {
            console.error('user.delete', error);
            throw new Meteor.Error('500', 'Ocurrio un error al eliminar un usuario');
        }
        return responseMessage;
    }
});

new ValidatedMethod ({
    name: 'user.updatePersonalData',
    mixins: [MethodHooks],
    beforeHooks: [AuthGuard.isUserLogged],
    validate({user}){
        try {
            check(user, {
                _id: Match.OneOf(String, null),
                username: String,
                emails: [{address: String, verified: Boolean}],
                profile: {
                    profile: String,
                    name: String,
                    path: Match.OneOf(String, null)
                }
            })
        } catch (error) {
            console.log('user.updatePersonalData', error);
            throw new Meteor.Error('403', 'La informacion introducida no es valida');
        }
        UsersServ.validateEmail(user.emails[0].address, user._id);
        UsersServ.validateUsername(user.username, user._id);
    },
    async run({user, photoFileUser}){
        const responseMessage = new ResponseMessage();
        try {
            // UPDATE USER 
            await UsersServ.updateUser(user, photoFileUser);
            responseMessage.create('Se actualizo la informacion exitosamente');
        } catch (error) {
            console.error('user.updatePersonalData', error);
            throw new Meteor.Error('500', 'Ocurrio un error al actualizar la informacion');
        }
        return responseMessage;
    }
}); 
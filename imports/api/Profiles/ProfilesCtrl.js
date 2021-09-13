import {check, Match} from 'meteor/check';
import AuthGuard from '../../middlewares/AuthGuard';
import Permissions from '../../startup/server/Permissions';
import { ResponseMessage } from '../../startup/server/utilities/ResponseMessage';
import {Profile} from './Profile';
import ProfilesServ from './ProfilesServ';

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
                Meteor.users.update({'profile.profile': oldProfile.name}, {
                    $set: {
                        'profile.profile': profile.name
                    }
                },{ multi:true });
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

new ValidatedMethod( {
    name: 'profile.delete',
    mixins: [MethodHooks],
    permissions: [Permissions.PROFILES.DELETE.VALUE],
    beforeHooks: [AuthGuard.checkPermission],
    validate({ idProfile }) {
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
    run({ idProfile }) {
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
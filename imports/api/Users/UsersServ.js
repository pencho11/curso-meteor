import FileOperations from '../../startup/server/utilities/FileOperations';
import ProfilesServ from '../Profiles/ProfilesServ';

const PATH_USER_FILES = 'users/';

export default {
    validateEmail(newEmail, idUser){
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
    validateUsername(newUsername, idUser){
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
    async createUser(user, photoFileUser){
        const idUser = Accounts.createUser({
            username: user.username,
            email: user.emails[0].address,
            profile: user.profile
        });
        let avatarSrc= null;
        if (idUser) {
            ProfilesServ.setUserRoles(idUser, user.profile.profile);
            Accounts.sendEnrollmentEmail(idUser, user.emails[0].address);
        }
        if (photoFileUser) {
            const response = await FileOperations.saveFileFromBase64ToGoogleStorage(photoFileUser, 'avatar',
            PATH_USER_FILES + idUser);
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
        })
    },
    async updateUser(user, photoFileUser){
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
        if(photoFileUser) {
            if (currentUser.profile.path) {
                await FileOperations.deleteFileFromGoogleStorageIfExists(currentUser.profile.path
                        .substring(currentUser.profile.path.indexOf(PATH_USER_FILES)));
            }
            const response = await FileOperations.saveFileFromBase64ToGoogleStorage(photoFileUser, 'avatar', PATH_USER_FILES + user._id);
            if (!response.data.success) {
                throw new Meteor.Error('403', 'Error al subir la foto.');
            } else {
                Meteor.users.update(user._id, {
                    $set: {
                        'profile.path': response.data.fileUrl
                    }
                })
            }
        }
    },
    async deleteUser (idUser) {
        Meteor.users.remove(idUser);
        Meteor.roleAssignment.remove({'user._id': idUser});
        await FileOperations.deleteFilesOfFolderFromGoogleStorage(PATH_USER_FILES + idUser);
    }
};
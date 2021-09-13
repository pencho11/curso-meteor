import { Profile } from "./Profile"
import { StaticProfiles } from "./ProfileSeeder";

export default {
    validateName(name, idProfile){
        const existName = Profile.findOne({name});
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
        return Meteor.users.find({'profile.profile': profile.name}).fetch();
    },
    setUserRoles(idUser, profileName) {
        const permissions = Profile.findOne({name: profileName}).permissions;
        Meteor.roleAssignment.remove({'user._id': idUser});
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
};
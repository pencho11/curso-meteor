import Permissions, {permissionsArray} from "../../startup/server/Permissions"
import { Profile } from "./Profile";

Profile.rawCollection().createIndex({'name': 1}, {unique: true});

export const StaticProfiles = {
    admin: {
        name: 'admin',
        description: 'Administrador',
        permissions: permissionsArray.map(p=>p.VALUE)
    }
};

if (Meteor.isDevelopment) {
    if (Meteor.settings.private && Meteor.settings.private.REFRESH_STATIC_PROFILES) {
        console.log('updating static profiles. . .');
        Object.keys(StaticProfiles).forEach(staticProfileName => {
            Profile.upsert({name: StaticProfiles[staticProfileName].name}, {
                $set: {
                    description: StaticProfiles[staticProfileName].description,
                    permissions: StaticProfiles[staticProfileName].permissions,
                }
            });
            Meteor.users.find({ 'profile.profile': StaticProfiles[staticProfileName].name}).fetch().forEach(user => {
                Meteor.roleAssignment.remove({'user._id': user._id});
                if (StaticProfiles[staticProfileName].permissions.length > 0) {
                    Roles.setUserRoles(user._id, StaticProfiles[staticProfileName].permissions, StaticProfiles[staticProfileName].name);
                }
            })
        });
    }
};
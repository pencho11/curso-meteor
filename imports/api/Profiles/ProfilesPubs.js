import { PermissionMiddleware } from "../../middlewares/PermissionsMiddleware";
import Permissions from "../../startup/server/Permissions";
import { Profile } from "./Profile"
import ProfilesServ from "./ProfilesServ";

const noStaticProfilesPublication = new PublishEndpoint('profile.listNotStaticProfiles', function() {
    return Profile.find({name: {$nin: ProfilesServ.getStaticProfileName() }});
}); 

const profilesPublication = new PublishEndpoint('profile.listAll', function() {
    return Profile.find();
}); 

profilesPublication.use(new PermissionMiddleware([Permissions.PROFILES.LIST.VALUE]));
noStaticProfilesPublication.use(new PermissionMiddleware([Permissions.PROFILES.LIST.VALUE]));
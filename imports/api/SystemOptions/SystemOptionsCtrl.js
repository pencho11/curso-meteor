import SystemOptions from "./SystemOptions";
import { ResponseMessage } from "../../startup/server/utilities/ResponseMessage";
import AuthGuard from "../../middlewares/AuthGuard";

new ValidatedMethod({
    name: 'user.getSystemOptions',
    mixins: [MethodHooks],
    beforeHooks: [AuthGuard.isUserLogged],
    validate: null,
    run(){
        const responseMessage = new ResponseMessage();
        const userLogged = Meteor.user();
        const userRoles = Roles.getRolesForUser(userLogged._id, userLogged.profile.profile);
        const optionsOfUser = SystemOptions.reduce(( accumulator, systemOption ) => {
            if (!systemOption.permission || !!userRoles.find(role => role === systemOption.permission)) {
                accumulator.push(systemOption);
            }
            return accumulator;
        }, [])
        responseMessage.create('Opciones del sistema de usuario.', null, optionsOfUser);
        return responseMessage;
    }
})
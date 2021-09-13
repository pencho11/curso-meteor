import { PermissionMiddleware } from "../../middlewares/PermissionsMiddleware";
import Permissions from "../../startup/server/Permissions";
import { Message } from "./Message";

const messagesPublication = new PublishEndpoint('messages.list', function(idContact = null) {
   const idUserLogged = this.userId;
   return Message.find({
       $or: [
           {idSender: idUserLogged, idReceiver: idContact},
           {idSender: idContact, idReceiver: idUserLogged}
       ]
   },{
       limit: 20,
       sort: {
           date: -1
       }
   });
});

messagesPublication.use(new PermissionMiddleware([Permissions.CHAT.LIST.VALUE]));
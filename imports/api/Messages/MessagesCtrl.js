import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {check} from 'meteor/check';
import AuthGuard from '../../middlewares/AuthGuard';
import {ResponseMessage} from '../../startup/server/utilities/ResponseMessage';
import { Message } from './Message';
import Permissions from '../../startup/server/Permissions';

new ValidatedMethod({
    name: 'message.save',
    mixins: [MethodHooks],
    beforeHooks: [AuthGuard.checkPermission],
    permissions: [Permissions.CHAT.CREATE.VALUE],
    validate (message) {
        try {
            check(message, {
                idSender: String,
                idReceiver: String,
                text: String,
                date: String,
                read: Boolean
            })
        } catch (error) {
            console.error('message.save', error);
            throw new Meteor.Error('403', 'La informacion introducida no es valida')
        }
    },
    run (message) {
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
    validate (messages) {
        try {
            check(messages, [
                {
                    _id: String,
                    idSender: String,
                    idReceiver: String,
                    text: String,
                    date: String,
                    read: Boolean
                }
            ]);
        } catch (error) {
            console.error('messages.read', error);
            throw new Meteor.Error('403', 'La informacion no es valida');
        }
    },
    run (messages) {
        const responseMessage = new ResponseMessage();
        try {
            Message.update({_id: {$in: messages.map(m => m._id) }},{
                $set: {
                    read: true
                }
            },{multi: true});
        } catch (error) {
            console.error('messages.read', error);
            throw new Meteor.Error('500', 'Ha ocurrido un error al marcar los mensajes como leidos.');
        }
        return responseMessage;
    }
});


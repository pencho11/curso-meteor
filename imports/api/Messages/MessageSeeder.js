import {Message} from './Message';

Message.rawCollection().createIndex({ idSender: 1 });
Message.rawCollection().createIndex({ idReceiver: 1 });
Message.rawCollection().createIndex({ date: 1 });
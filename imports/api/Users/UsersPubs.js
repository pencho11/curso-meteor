import {Meteor} from 'meteor/meteor';
import {PublishEndpoint} from 'meteor/peerlibrary:middleware';
import { PermissionMiddleware } from '../../middlewares/PermissionsMiddleware';
import Permissions from '../../startup/server/Permissions';

const usersPublication = new PublishEndpoint('user.list', function() {
    return Meteor.users.find({}, {
        sort: {createdAt: -1}
    });
});

usersPublication.use(new PermissionMiddleware([Permissions.USERS.LIST.VALUE]));
export class PermissionMiddleware extends PublishMiddleware {
    constructor (permissions) {
        super();
        this._permissions = permissions;
    }
    
    added (publish, collection, id, fields) {
        if (publish.userId) {
            return super.added(...arguments);
        }
        return publish.ready();
    }
    
    change (publish, collection, id, fields) {
        if (this.checkPermission(publish.userId)) {
            return super.changed(...arguments);
        }
        return publish.ready();
    }
    
    removed (publish, collection, id) {
        if (this.checkPermission(publish.userId)) {
            return super.removed(...arguments);
        }
        return publish.ready();
    }

    onReady (publish) {
        if (publish.userId) {
            return super.onReady(...arguments);
        }
    }

    onStop (publish) {
        if (publish.userId) {
            return super.onStop(...arguments);
        }
    }

    onError (publish) {
        if (publish.userId) {
            return super.onError(...arguments);
        }
    }

    checkPermission (idUser) {
        const profileName = Roles.getScopesForUser(idUser)[0];
        return Roles.userIsInRole(idUser, this._permissions, profileName);
    }
};
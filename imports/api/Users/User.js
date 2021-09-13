import { User } from 'meteor/socialize:user-model';
import SimpleSchema from "simpl-schema";

Meteor.users.rawCollection().createIndex({ 'profile.profile': 1 });

const UserProfileSchema = new SimpleSchema({
    profile: {
        type: Object,
        optional: false,
        blackbox: true
    }
});

User.attachSchema( UserProfileSchema );
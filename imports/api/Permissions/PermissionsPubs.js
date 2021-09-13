Meteor.publish('roles', function() {
    return Meteor.roleAssignment.find({ 'user._id' : this.userId });
});
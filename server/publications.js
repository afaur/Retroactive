Meteor.publish('people', function () {
  return People.find({});
});

Meteor.publish('jiraData', function () {
  return JiraData.find({});
});

Meteor.publish('action', function () {
  return Action.find({});
});

Meteor.publish("currentUserData", function() {
  return Meteor.users.find({}, {
    fields : {
      'userId' : 1,
      'profile' : 1
    }
  });
});

Meteor.publish('userPresence', function() {
  // Setup some filter to find the users your logged in user
  // cares about. It's unlikely that you want to publish the
  // presences of _all_ the users in the system.
  var filter = {
    _id: {
      $ne: this.connection.sessionKey // don't publish the current user
    },
    status: 'online' // publish only clients that called 'setPresence'
  };
  // ProTip: unless you need it, don't send lastSeen down as it'll make your
  // templates constantly re-render (and use bandwidth)
  return presences.find(filter, {fields: {state: true, userId: true, name: true}});
});


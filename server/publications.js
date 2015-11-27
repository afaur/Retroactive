Meteor.publish('people', function () {
  return People.find({});
});

Meteor.publish('jiraData', function () {
  return JiraData.find({});
});

Meteor.publish('action', function () {
  return Action.find({});
});


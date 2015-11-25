Meteor.startup( () => {
  seedMockPeopleData();
  seedJiraData();
});

seedMockPeopleData = (callback) => {
  //People.remove({});
  if (People.find().count() == 0) {
    for (var i = 0; i < 5000; i++) {
      People.insert({name: Fake.word().toLowerCase()});
    }
  }
  People._ensureIndex({_id: 1});
  People._ensureIndex({name: 1});
}

seedJiraData = (callback) => {

  //JiraData.remove({});
  if (JiraData.find().count() == 0) {

    var JiraClient = Meteor.npmRequire('jira-connector');

    var jira = new JiraClient( {
      host: 'vitals.atlassian.net',
      basic_auth: {
        username: Meteor.settings.jira_username,
        password: Meteor.settings.jira_password
      }
    });

    // Async get backlog issue data from jira api
    var docs = Async.runSync( (done) => {
      jira.search.search({
        jql: "project = 'Vitals Website' AND issuetype != Epic " +
            "AND resolution = Unresolved AND (Sprint = EMPTY "  +
            "OR Sprint not in (openSprints(), futureSprints()))"
      }, (error, issue) => {
        done(null,issue);
      });

    });

    // Get async data response issues
    var raw_data = docs.result.issues;

    // Collect only the keys we want to persist
    var final_data = _.map(raw_data, (issue) => {
      return _.extend(
        _.pick(issue, 'key'),
        _.pick(issue.fields,
          'summary', 'description', 'created', 'updated',
          'components', 'aggregatetimeestimate',
          'aggregatetimeoriginalestimate', 'timeestimate',
          'timeoriginalestimate', 'timespent', 'aggregatetimespent',
          'creator', 'reporter', 'assignee',
          'issuetype', 'priority', 'status'
      ));
    });

    // Store our issue data
    _.each(final_data, (issue) => {
      JiraData.insert(issue);
    });

    JiraData._ensureIndex({_id: 1});
    JiraData._ensureIndex({key: 1});

  }

}


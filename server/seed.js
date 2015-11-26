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

applyFilterOnIssueKeys = (issue) => {
  return _.extend(
    _.pick(issue, 'key'),
    _.pick(issue.fields,
      'summary', 'description', 'created', 'updated',
      'components', 'aggregatetimeestimate',
      'aggregatetimeoriginalestimate', 'timeestimate',
      'timeoriginalestimate', 'timespent', 'aggregatetimespent',
      'creator', 'reporter', 'assignee',
      'issuetype', 'priority', 'status')
  );
}

applyRankFromIssuePriority = (issue_priority) => {
  return _.transform(
    _.pick(issue_priority, 'name'),
    (result, n, key) => {
      let rank_val = 0;
      switch(n) {
        case "Blocker":
          rank_val = 10;
          break;
        case "Critical":
          rank_val = 9;
          break;
        case "Major":
          rank_val = 8;
          break;
        case "High":
          rank_val = 7;
          break;
        case "Medium":
          rank_val = 6;
          break;
        case "Low":
          rank_val = 5;
          break;
        case "Minor":
          rank_val = 4;
          break;
        case "Trivial":
          rank_val = 3;
          break;
        default:
          rank_val = 1;
      }
      result['rank'] = rank_val;
    }
  );
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
        // Gauge priority and add a rank property to issues based on it.
        applyRankFromIssuePriority(
          issue.fields.priority
        ),
        // Filter out keys we don't want from the jira api
        applyFilterOnIssueKeys(
          issue
        )
      );
    });

    // Store our issue data
    _.each(final_data, (issue) => {
      JiraData.insert(issue);
    });

    // Setup some indexes for faster searching
    JiraData._ensureIndex({_id: 1});
    JiraData._ensureIndex({id: 1});
    JiraData._ensureIndex({key: 1});

  }

}


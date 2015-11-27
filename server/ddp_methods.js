updateIssueTime = (issue_id, init_option) => {

  let alreadyExists = Action.find({
    'type': 'issue_change',
    'issue_id': issue_id
  }).fetch();

  if (alreadyExists.length > 0) {

    if (init_option === false) {
      var duration = alreadyExists[0]['duration_in_sec'];
    } else {
      var delta    = Math.ceil(((new Date().getTime()) -  alreadyExists[0]['started_on']) / 1000);
      var duration = alreadyExists[0]['duration_in_sec'] + delta;
    }

    Action.upsert({
      'type': 'issue_change',
      'issue_id': issue_id
    }, {
      $set: {
        'started_on': new Date().getTime(),
        'duration_in_sec': duration
      }
    });

  } else {

    Action.insert({
      'type': 'issue_change',
      'issue_id': issue_id,
      'started_on': new Date().getTime(),
      'duration_in_sec': 0
    });

  }

}

Meteor.methods({

  getJiraResults() {

    var JiraClient = Meteor.npmRequire('jira-connector');

    var jira = new JiraClient( {
      host: 'vitals.atlassian.net',
      basic_auth: {
        username: Meteor.settings.jira_username,
        password: Meteor.settings.jira_password
      }
    });

    var docs = Async.runSync( (done) => {
      jira.search.search({
        jql: "project = 'Vitals Website' AND issuetype != Epic AND resolution = Unresolved AND (Sprint = EMPTY OR Sprint not in (openSprints(), futureSprints()))"
      }, function(error, issue) {
        done(null,issue);
      });

    });

    return docs.result;

  },

  changeFromExistingIssue(old_issue_id, issue_id) {
    updateIssueTime(old_issue_id, true);
    updateIssueTime(issue_id, false);
  },

  changeIssue(issue_id) {
    updateIssueTime(issue_id, true);
  }

});


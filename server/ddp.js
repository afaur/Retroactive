Meteor.methods({

  getJiraResults() {

    var JiraClient = Meteor.npmRequire('jira-connector');

    var jira = new JiraClient( {
      host: 'vitals.atlassian.net',
      basic_auth: {
        username: '',
        password: ''
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

  }

});


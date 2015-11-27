getJiraResults = (callback) => {
  Meteor.call('getJiraResults', callback);
}

var access = false;

changeAccess = (level) => {
  if (level = 'admin') {
    access = true;
  } else {
    access = false;
  }
}

// Timer variables
var timerValue = new ReactiveVar('00:00');
var timerInterval;

updateTimer = () => {
  var tempTimer = timerValue.get();
  var min = tempTimer.split(':')[0];
  var sec = tempTimer.split(':')[1];
  var totalTime = (parseInt(min,10) * 60) + parseInt(sec,10);
  totalTime++;
  min = Math.floor(totalTime / 60);
  sec = totalTime - (min * 60);
  var minExtra = '';
  var secExtra = '';
  if (min < 10) { minExtra = '0'; }
  if (sec < 10) { secExtra = '0'; }
  timerValue.set('' + minExtra + min + ':' + secExtra + sec);
}

issueChangeDelta = (started_on, duration_in_sec) => {
  let current_time_unix_timestamp = parseInt(moment().utc().format('x'),10);
  let modified_time_unix_timestamp = started_on;
  let time_diff = ((current_time_unix_timestamp - modified_time_unix_timestamp) / 1000) + duration_in_sec;
  let time_diff_min = Math.floor(time_diff / 60);
  let time_diff_sec = Math.ceil(time_diff) - (time_diff_min * 60);
  let minExtra = '';
  let secExtra = '';
  if (time_diff_min < 10) { minExtra = '0'; }
  if (time_diff_sec < 10) { secExtra = '0'; }
  return '' + minExtra + time_diff_min + ':' + secExtra + time_diff_sec;
}

changeIssue = (issue_id, started_on, duration_in_sec) => {
  if (timerInterval !== undefined) {
    Meteor.clearInterval(timerInterval);
  }
  timerValue.set(
    issueChangeDelta(started_on, duration_in_sec)
  );
  Session.set('current_issue', issue_id);
  timerInterval = Meteor.setInterval(updateTimer, 1000);
}

// Watchers

monitorIssueChange = () => {
  // When an admin changes active ticket change with them.
  jsonData = Action.findOne({
    'type': 'issue_change'
  }, {
    'sort': {
      'started_on': -1
    }
  });
  if (jsonData) {
    changeIssue(
      jsonData['issue_id'],
      jsonData['started_on'],
      jsonData['duration_in_sec']
    );
  }
}

Action.find().observeChanges({
  added: function() {
    monitorIssueChange();
  },
  changed: function() {
    monitorIssueChange();
  }
});

currentIssue = () => {
  var current_issue_id = Session.get('current_issue');
  if (current_issue_id !== undefined) {
    return JiraData.findOne({'_id': current_issue_id});
  } else {
    return {
      key: 'Default Ticket',
      summary: 'Default Summary',
      description: 'Default Description'
    };
  }
}

Template.largeLayout.events({
  "click li#issue_key": (event) => {
    if (access) {

      let issue_id = $(event.target).data( "issueId" );

      if (Session.get('current_issue') !== undefined) {
        Meteor.call(
          'changeFromExistingIssue',
          Session.get('current_issue'),
          issue_id
        );
      } else {
        Meteor.call(
          'changeIssue',
          issue_id
        );
      }

    } else {
      alert('Only the admin can do this.');
    }
  },
  "click h3#logout": (event) => {
    Session.set('current_issue', undefined);
  }
});

Template.largeLayout.helpers({
  timer() { return timerValue.get(); },
  current_issue() { return currentIssue(); },
  playerCards() { return [
      {name: "Joe",    turned: 'down', display: '1', points: 1},
      {name: "John",   turned: 'down', display: '1', points: 1},
      {name: "James",  turned: 'down', display: '1', points: 1},
      {name: "Jack",   turned: 'down', display: '1', points: 1},
      {name: "Jan",    turned: 'down', display: '1', points: 1},
      {name: "Jane",   turned: 'down', display: '1', points: 1},
    ];
  },
  estimateCards() { return [
      {display: '1', points: 1},
      {display: '2', points: 2},
      {display: '3', points: 3},
      {display: '5', points: 5},
      {display: '8', points: 8},
      {display: '?', points: 0},
    ];
  }
});


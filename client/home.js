// Timer variables
var timerValue = new ReactiveVar('00:00');
var timerInterval;

getJiraResults = (callback) => {
  Meteor.call('getJiraResults', callback);
}

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

startTimer = () => {
  timerInterval = Meteor.setInterval(updateTimer, 1000);
}

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

Template.autocomplete.helpers({
  settings() {
    return {
      position: "bottom",
      limit: 15,
      rules: [
        {
          token: '@',
          collection: 'People',
          field: 'name',
          //filter: { type: "autocomplete" },
          options: '',
          template: Template.peoplePill
        }
      ]
    };
  }
});

Template.largeLayout.events({
  "click li#issue_key": (event) => {
    if (timerInterval !== undefined) {
      Meteor.clearInterval(timerInterval);
      timerValue.set('00:00');
    }
    var ticket_id = $(event.target).data( "ticketId" );
    Session.set('current_issue', ticket_id);
    startTimer();
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


getJiraResults = (callback) => {
  Meteor.call('getJiraResults', callback);
}

writeTimer = (ticket_id) => {
  // store a utc datetime into mongo that indicates when this
  // ticket was started in the estimating process
  JiraData.update({'_id': ticket_id}, {"$set": { "timerstart": moment.utc().toDate().toUTCString() } });
}

startTimer = (ticket_id) => {
  writeTimer(ticket_id);
  alert('Started Timer.');
}

readTimer = (ticket) => {
  var current_issue_id = Session.get('current_issue');
  if (current_issue_id !== undefined) {
    return JiraData.findOne({'_id': current_issue_id});
  } else {
    return {'timerstart': 'Default Timer'};
  }
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
  "click h3#issue_key": (event) => {
    var ticket_id = $(event.target).data( "ticketId" );
    Session.set('current_issue', ticket_id);
    alert('Ticket changed.');
    startTimer(ticket_id);
  },
  "click h3#logout": (event) => {
    Session.set('current_issue', undefined);
    alert('Logout success.');
  }
});

Template.largeLayout.helpers({
  timer() { return readTimer(); },
  current_issue() { return currentIssue(); },
  issues() {
    return JiraData.find({});
  }
});


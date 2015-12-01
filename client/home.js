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

Template.home.events({
  "click #login-buttons": (event) => {
    if ($(".login-close-text").length > 0) {
      event.preventDefault();
      $(".login-close-text").trigger('click');
    }
  },
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

// Player card points
var playerCardPoints = new ReactiveVar({});

getPlayerCardPoints = (playerId) => {
  var playersPoints = playerCardPoints.get();
  if (playersPoints.hasOwnProperty(playerId)) {
    return playersPoints[playerId];
  } else {
    return -1;
  }
};

savePlayerCardPoints = (points) => {
  var playersPoints = playerCardPoints.get();
  playersPoints[Meteor.userId()] = points;
  playerCardPoints.set( playersPoints );
};

getCommonNumber = (store) => {
  var frequency = {};  // array of frequency.
  var max = 0;  // holds the max frequency.
  var result;   // holds the max frequency element.
  for(var v in store) {
    frequency[store[v]]=(frequency[store[v]] || 0)+1; // increment frequency.
    if(frequency[store[v]] > max) { // is this frequency > max so far ?
      max = frequency[store[v]];  // update max.
      result = store[v];          // update result.
    }
  }
  return result;
};

collectPoints = () => {
  var playersPoints = playerCardPoints.get();
  var collection = [];
  for (var key in playersPoints) {
    if (playersPoints.hasOwnProperty(key)) {
      collection.push(playersPoints[key]);
    }
  }
  return collection;
};

getFinalEstimate = () => {
  var collection = collectPoints();
  if (readyToFlip()) {
    return getCommonNumber(collection);
  } else {
    return '?';
  }
};

readyToFlip = () => {
  var collection = collectPoints();
  if (collection.indexOf(-1) === -1 && collection.length > 0) {
    return true;
  } else {
    return false;
  }
};


Template.home.helpers({
  timer() { return timerValue.get(); },
  current_issue() { return currentIssue(); },
  users_name() { return Meteor.user()['profile']['name']; },
  people_here() { return presences.find(); },
  estimate() {
    return getFinalEstimate();
  },
  playerCards() {
    var IdsHere   = presences.find().fetch();
    var cardsHere = _.map(IdsHere, (person) => {
      return {
        name: Meteor.users.find({"_id": person['userId']}).fetch()[0]['profile']['name'],
        turned: (readyToFlip() === true ? 'up':'down'),
        points: getPlayerCardPoints(person['userId'])
      };
    });
    var myCard = {
      name: Meteor.user()['profile']['name'],
      turned: (readyToFlip() === true ? 'up':'down'),
      points: getPlayerCardPoints(Meteor.userId())
    };
    cardsHere.push(myCard);

    return cardsHere;
  },
  estimateCards() {
    var seq = [1,2,3,5,8,'?'];
    return _.map(seq, (value) => {
      var points = value;
      if (value === '?') { points = 0; }
      return {display: ''+value, points: points};
    });
  }
});


// Use lodash instead of underscore
_ = lodash;

Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  templateNameConverter: 'upperCamelCase'
});

Router.plugin('ensureSignedIn', {
  only: ["home"]
});

Router.map( function() {
  this.route('logout', {
    path: '/logout',
    onBeforeAction: function() {
      Meteor.logout(function() {
        Router.go('login');
      });
    }
  });
  this.route('login', {
    path: '/',
    layoutTemplate: 'main',
    template: 'login',
    waitOn: function() {},
    data: function() {}
  });
  this.route('home', {
    path: '/plan',
    layoutTemplate: 'main',
    template: 'home',
    waitOn: function() {
      return [
        this.subscribe('jiraData'),
        this.subscribe('action'),
        this.subscribe('userPresence'),
        this.subscribe("currentUserData")
      ];
    },
    data: function() {
      return {
        issues: JiraData.find({}, {sort: {"rank": -1, "key": 1}})
      };
    }
  })
});


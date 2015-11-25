//Router.plugin('loading', {loadingTemplate: 'Loading'});

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  templateNameConverter: 'upperCamelCase'
});

Router.map( function() {
  this.route('home', {
    path: '/',
    template: 'home',
    waitOn: function() {
      return this.subscribe('jiraData');
    },
    data: function() {
      return {
        issues: JiraData.find()
      };
    }
  })
});


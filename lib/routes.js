_ = lodash;

var renderer = new marked.Renderer();

marked.setOptions({
  renderer: renderer,
  gfm: false,
  tables: false,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  smartypants: false
});

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  templateNameConverter: 'upperCamelCase'
});

Router.map( function() {
  this.route('home', {
    path: '/',
    layoutTemplate: 'main',
    template: 'home',
    waitOn: function() {
      return [this.subscribe('jiraData'), this.subscribe('action')];
    },
    data: function() {
      return {
        issues: JiraData.find({}, {sort: {"rank": -1, "key": 1}})
      };
    }
  })
});


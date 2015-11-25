getJiraResults = (callback) => {
  Meteor.call('getJiraResults', callback);
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

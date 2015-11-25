Meteor.startup( () => {
  People.remove({});
  //if (People.find().count() == 0) {
  for (var i = 0; i < 5000; i++) {
    People.insert({name: Fake.word().toLowerCase()});
  }
  //}
  People._ensureIndex({name: 1});
});


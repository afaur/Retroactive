describe( "home", () => {
  describe( "template", () => {
    it( "shows welcome text in first h1", () => {

      expect(
        $('h1').text()
      ).toEqual('Welcome to Foundation');

    });
  });
});

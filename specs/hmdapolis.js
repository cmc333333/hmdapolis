describe("HMDA game", function() {

  it("should have its number of players greater than the current player", function() {
    expect(HMDA.game.get('numPlayers')).toBeGreaterThan(HMDA.game.get('currentPlayer'));
  });




});
describe("HMDA game", function() {

  it("should have its total number of players be greater than the current player's number", function() {
    expect(HMDA.game.get('numPlayers')).toBeGreaterThan(HMDA.game.get('currentPlayer'));
  });




});
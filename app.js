/**
 *  IT'S GO TIME
 **/

var HMDA = HMDA || {
  models: {},
  views: {},
  collections: {}
};


/**
 *  Main data model, keeps track of game state
 **/

HMDA.models.game = Backbone.Model.extend({

  defaults: {
    turn: 0,
    numPlayers: 2,
    currentPlayer: 1,
    agencies: [],
    cities: []
  },

  initialize: function() {

    var self = this;

    $.when(self.fetchAgencies(), self.fetchCities()).done(function(agencies, cities){

      agencies = _.map(agencies[0], function(agency){
        return agency.id;
      });

      cities = _.map(cities[0], function(city){
        return city;
      });

      HMDA.game.set('agencies', agencies);

      HMDA.game.set('cities', cities);

      self.startGame();

    });
  },

  newTurn: function() {

    HMDA.persons.add();

    var currentPlayer = this.get('currentPlayer') + 1;

    if (currentPlayer > this.get('numPlayers')) {
      currentPlayer = 1;
    }

    this.set('currentPlayer', currentPlayer);

  },

  getRand: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  popRand: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  dollarize: function(n) {
    return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  fetchAgencies: function() {
    return $.getJSON('http://127.0.0.1:8000/json/agencies.json', function(data){
    });
  },

  fetchCities: function() {
    return $.getJSON('http://127.0.0.1:8000/json/cities.json', function(data){
    });
  },

  startGame: function() {

    HMDA.persons = new HMDA.collections.persons([new HMDA.models.person()]);

    HMDA.gameView = new HMDA.views.game({model: HMDA.game});

    HMDA.squares = new HMDA.collections.squares({model: new HMDA.models.square});

    HMDA.board = new HMDA.views.board({collection: HMDA.squares});

    HMDA.personsView = new HMDA.views.persons({collection: HMDA.persons});

    $('#players').append(HMDA.personsView.render().el);

  }

});


/**
 *  Person model stores info about persons
 **/

HMDA.models.person = Backbone.Model.extend({

  defaults: {
    score: 0,
    income: 0,
    year: 0,
    agency: ''
  },

  initialize: function() {
    this.set('income', HMDA.game.dollarize(HMDA.game.getRand(20000, 130000)));
    this.set('year', HMDA.game.getRand(2003, 2013));
    this.set('agency', HMDA.game.popRand(HMDA.game.get('agencies')));
    this.incrementTurn();
  },

  incrementTurn: function() {
    var turn = HMDA.game.get('turn');
    HMDA.game.set('turn', turn + 1, {silent: true});
  }

});

HMDA.collections.persons = Backbone.Collection.extend({

  model: HMDA.models.person

});

HMDA.models.square = Backbone.Model.extend({

  defaults: {
    type: 'home',
    value: '',
    owner: undefined,
    x: 1,
    y: 1
  },

  getCity: function () {
    var cities = HMDA.game.get('cities');
    return cities.splice(Math.floor(Math.random() * cities.length), 1);
  },

  getStats: function() {
    $.getJSON('http://192.168.53.16:8180?callback=?', function(data) {

    });
  }

});

HMDA.collections.squares = Backbone.Collection.extend({

  width: 7,
  height: 7

});

HMDA.views.game = Backbone.View.extend({

  el: 'body',

  initialize: function() {
    this.model.on('change', this.setPlayer, this);
  },

  events: {
    'click h1': 'newTurn'
  },

  newTurn: function() {
    this.model.newTurn();
  },

  setPlayer: function() {
    //console.log(this.model.get('currentPlayer'));
    this.$el.removeClass().addClass('s-player-' + this.model.get('currentPlayer'));
  },

  render: function() {

  }

});

HMDA.views.person = Backbone.View.extend({

  tagName: 'div',

  events: {

  },

  template: function(person) {
    return _.template($('#person-stats').html(), person);
  },

  initialize: function() {
    //this.render();
  },

  render: function() {
    var self = this;
    this.$el.fadeOut(100, function() {
      $(this).html(self.template(self.model.toJSON())).fadeIn(100);
    });
    return this;
  }

});

// persons collection views
HMDA.views.persons = Backbone.View.extend({

  el: '.profile',

  initialize: function() {
    this.collection.on('add', this.addOne, this);
  },

  addOne: function(model){
    var personView = new HMDA.views.person({model: model});
    this.$el.html(personView.render().el);
  },

  render: function() {
    var lastPerson = this.collection.at(this.collection.length - 1);
    this.addOne(lastPerson);
    //console.log(lastPlayer);
    return this;
  }

});

HMDA.views.square = Backbone.View.extend({

  tagName: 'li',

  events: {
    'click': 'playSquare'
  },

  initialize: function() {
    this.model.on('change', this.render, this);
    _.bindAll(this, 'render', 'playSquare');
    this.render();
  },

  getNeighbors: function(x, y) {
    //  Odd rows are off kilter. Account for that
    var odd_offset = y % 2 * -1;
    var pairs = [[-1, odd_offset], [-1, odd_offset + 1],  
                [0, -1], [0, 1],
                [1, odd_offset], [1,odd_offset + 1]];
    var neighbors = Array();
    _.each(pairs, function(pair) {
        var mod_x = x + pair[1];
        var mod_y = y + pair[0];
        if (HMDA.board.matrix[mod_y] && HMDA.board.matrix[mod_y][mod_x]) {
            neighbors.push($(HMDA.board.matrix[mod_y][mod_x].$el));
        }
    });
    return neighbors;
  },

  playSquare: function() {
    var x = this.model.get('x'),
        y = this.model.get('y');

    _.each(this.getNeighbors(x, y), function(item){
      item.addClass('neighbor');
    });

  },

  render: function() {
    if (this.model.get('owner')) {
      this.$el.addClass('chosen');
      this.model.set('value', this.model.get('value') + '<br />' + this.model.get('owner'));
    } else if (this.model.get('type') === 'city') {
      this.$el.addClass('city');
    } else if (this.model.get('type') === null) {
      this.$el.addClass('null');
    }
    this.$el.html('<span>' + this.model.get('value') + '</span>').attr('data-x', this.model.get('x')).attr('data-y', this.model.get('y'));
    return this;
  }

});

HMDA.views.board = Backbone.View.extend({

  el: '#board',

  events: {

  },

  initialize: function() {
    _.bindAll(this, 'render');
    this.populate();
    this.render();
  },

  populate: function() {
    this.matrix = new Array();
    for (var row = 0; row < this.collection.height; row += 1) {
      this.matrix[row] = Array();
      var row_width = this.collection.width;
      for (var col = 0; col < row_width; col += 1) {
        var model = new HMDA.models.square({x:col, y:row});
        model.set('type', 'home');
        model.set('value', HMDA.game.dollarize(HMDA.game.getRand(
                        50000, 500000)));
        this.matrix[row][col] = new HMDA.views.square({
          model: model
        });
      }
    }
    //  Now, flip some tiles to cities
    for (var row = 0; row < this.matrix.length; row += 1) {
      for (var col = 0; col < this.matrix[row].length; col += 1) {
        var model = this.matrix[row][col].model;
        if (!HMDA.game.getRand(0, 8)) {
          model.set('type', 'city');
          model.set('value', model.getCity());
        }
      }
    }
  },

  render: function() {
    for (var row = 0; row < this.matrix.length; row += 1) {
      var row_ul = document.createElement('ul');
      var stripe = (row % 2 === 0) ? 'odd': 'even';
      row_ul.className = 'row ' + stripe;
      for (var col = 0; col < this.matrix[row].length; col += 1) {
        row_ul.appendChild(this.matrix[row][col].el);
      }
      this.$el.append(row_ul);
    }
  }

});

$(function(){

  HMDA.game = new HMDA.models.game;
  

});

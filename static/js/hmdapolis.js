//   /$$   /$$ /$$      /$$ /$$$$$$$   /$$$$$$  /$$$$$$$   /$$$$$$  /$$       /$$$$$$  /$$$$$$
//  | $$  | $$| $$$    /$$$| $$__  $$ /$$__  $$| $$__  $$ /$$__  $$| $$      |_  $$_/ /$$__  $$
//  | $$  | $$| $$$$  /$$$$| $$  \ $$| $$  \ $$| $$  \ $$| $$  \ $$| $$        | $$  | $$  \__/
//  | $$$$$$$$| $$ $$/$$ $$| $$  | $$| $$$$$$$$| $$$$$$$/| $$  | $$| $$        | $$  |  $$$$$$
//  | $$__  $$| $$  $$$| $$| $$  | $$| $$__  $$| $$____/ | $$  | $$| $$        | $$   \____  $$
//  | $$  | $$| $$\  $ | $$| $$  | $$| $$  | $$| $$      | $$  | $$| $$        | $$   /$$  \ $$
//  | $$  | $$| $$ \/  | $$| $$$$$$$/| $$  | $$| $$      |  $$$$$$/| $$$$$$$$ /$$$$$$|  $$$$$$/
//  |__/  |__/|__/     |__/|_______/ |__/  |__/|__/       \______/ |________/|______/ \______/

/**
 *  DEBUGGING, BRO.
 **/

/*
var config = {
  agencies: "http://127.0.0.1:8000/static/json/agencies.json",
  cities: "http://127.0.0.1:8000/static/json/cities.json",
  stats: "http://127.0.0.1:8000/static/json/apply.json?"
};
*/

var config = {
  agencies: "http://166.78.123.230:8180/agency/?callback=?",
  cities: "http://166.78.123.230:8180/city/?callback=?",
  stats: "http://166.78.123.230:8180/apply/?callback=?&"
};

/**
 *  IT'S GO TIME, GOGOGOGOGO
 **/

var HMDA = HMDA || {
  models: {},
  views: {},
  collections: {},
  server: config
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
    cities: [],
    talk: ["Choose responsibly!", "Dallas looks nice this time of year.", "It's a buyer's market!", "I ain't afraid of no foreclosure."],
    cityMap: {}
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

    var currentPlayer = this.get('currentPlayer') + 1;

    if (currentPlayer > this.get('numPlayers')) {
      currentPlayer = 1;
    }

    this.set('currentPlayer', currentPlayer);

    HMDA.persons.add();

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
    HMDA.squares = new HMDA.collections.squares({model: new HMDA.models.square()});
    HMDA.board = new HMDA.views.board({collection: HMDA.squares});
    HMDA.personsView = new HMDA.views.persons({collection: HMDA.persons});
    $('#players').append(HMDA.personsView.render().el);

    new Audio('/static/audio/hmdapolis.wav').play();

  }

});


/**
 *  Person model stores info about an individual person.
 *  These are stored in the persons collection.
 **/

HMDA.models.person = Backbone.Model.extend({

  defaults: {
    score: 0,
    income: 0,
    year: 0,
    agency: ''
  },

  initialize: function() {

    //  This is a goodly range, but for game purposes, we'll make it a bit
    //  harder
    //this.set('income', HMDA.game.getRand(30000, 250000));
    this.set('income', HMDA.game.getRand(30000, 175000));
    this.set('year', HMDA.game.getRand(2006, 2011));
    var agency = HMDA.game.popRand(HMDA.game.get('agencies'));
    //  Don't show CFPB pre-20
    if (this.get('year') > 2010 && agency === 'OTS') {
      agency = 'CFPB';
    }
    if (this.get('year') < 2011 && agency === 'CFPB') {
      agency = 'OTS';
    }
    this.set('agency', agency);

    this.set('talk', HMDA.game.popRand(HMDA.game.get('talk')));
    this.incrementTurn();

  },

  incrementTurn: function() {

    var turn = HMDA.game.get('turn');
    HMDA.game.set('turn', turn + 1, {silent: true});

  }

});


/**
 *  Collection of person models
 **/

HMDA.collections.persons = Backbone.Collection.extend({

  model: HMDA.models.person

});


/**
 *  A square is an individual tile on the game board
 **/

HMDA.models.square = Backbone.Model.extend({

  defaults: {
    type: 'home',
    text: '',
    value: 0,
    owner: undefined,
    x: 1,
    y: 1
  },

  getCity: function () {

    var cities = HMDA.game.get('cities');
    return cities.splice(Math.floor(Math.random() * cities.length), 1);

  },

  getStats: function() {
    var player = HMDA.persons.at(HMDA.persons.length - 1),
        cities = HMDA.board.nearbyCities(this.get('y'), this.get('x')),
        city = cities[0].model.get('text'),
        msa_md = HMDA.game.get('cityMap')[city];

    var params = {
      year: player.get('year') % 2000,
      loan_amount: Math.floor(this.get('value') / 1000),
      msa_md: msa_md,
      applicant_income: Math.floor(player.get('income') / 1000),
      agency: player.get('agency')
    };

    return $.getJSON(HMDA.server.stats + $.param(params));
  }

});


/**
 *  Collection of squares
 **/

HMDA.collections.squares = Backbone.Collection.extend({

  width: 7,
  height: 7

});


/**
 *  View of the global game model
 **/

HMDA.views.game = Backbone.View.extend({

  el: 'body',

  initialize: function() {

    this.model.on('change', this.setPlayer, this);
    this.model.on('loading', this.startLoading, this);
    this.model.on('stop-loading', this.stopLoading, this);

  },

  events: {
    'click h1': 'newTurn'
  },

  newTurn: function() {

    this.$el.removeClass('s-waiting s-approved s-denied');
    this.$el.find('li').removeClass('s-waiting s-approved s-denied');

    if ($('#board li:not([class])').length === 0) {

      this.endGame();

    } else {

      this.model.newTurn();

    }

  },

  endGame: function() {

    var winner = _.indexOf(HMDA.board.points(), _.max(HMDA.board.points())) + 1;

    this.$el.addClass('s-winner-player-' + winner);

    _.each(HMDA.board.points(), function(el, i) {
      $('#players .player-' + (i + 1) + ' .score').html(HMDA.board.points()[i] + ' pts');
    });

  },

  setPlayer: function() {
    this.$el.removeClass().addClass('s-player-' + this.model.get('currentPlayer'));
  },

  startLoading: function() {
    this.$el.addClass('s-waiting');
  },

  stopLoading: function(status) {

    this.$el.removeClass('s-waiting');
    this.showModal(status);
    this.$el.find('li').removeClass('s-waiting s-approved s-denied');

    if (status.success) {
      this.$el.addClass('s-approved');
      var approved = Audio('/static/audio/mortgage-approved.wav');
      approved.play();
    } else {
      this.$el.addClass('s-denied');
      var denied = Audio('/static/audio/mortgage-denied.wav');
      denied.play();
    }

  },

  showModal: function(status) {

    var overlay = _.template($('#modal-overlay').html(), status);
    $('#overlay').remove();
    this.$el.append(overlay);
    this.genChart(status.accepted, status.rejected);

  },

  genChart: function(accepted, rejected) {

    new Highcharts.Chart({
      chart: {
          renderTo: 'comparison-chart',
          backgroundColor: 'rgba(255,255,255,0)',
          plotBackgroundColor: 'rgba(255,255,255,0)',
          plotBorderWidth: null,
          plotShadow: false,
          spacingTop: 0,
          spacingRight: 0,
          spacingBottom: 0,
          spacingLeft: 0
      },
      credits: {
          enabled: false
      },
      title: {
          text: null
      },
      tooltip: {
        enabled: false
      },
      plotOptions: {
          pie: {
              size: '90%',
              shadow: false,
              borderWidth: '3',
              dataLabels: {
                  enabled: false
              },
              states: {
                hover: {
                  enabled: false
                }
              }
          }
      },
      series: [{
          type: 'pie',
          name: 'Name example',
          data: [
              ['Approved',   accepted],
              ['Denied',     rejected]
          ]
      }],
      colors: [
        '#43AB7E',
        '#D44655'
      ]
    });

  },

  render: function() {

  }

});


/**
 *  At this point this just populates the left sidebar with person stats
 **/

HMDA.views.person = Backbone.View.extend({

  tagName: 'div',

  events: {

  },

  template: function(person) {
    return _.template($('#person-stats').html(), person);
  },

  initialize: function() {
  
  },

  render: function() {

    var self = this;

    // there's a chrome bug that doesn't erase the previous node before redrawing
    // so we fadeout over 1 ms with a callback
    this.$el.fadeOut(1, function() {

      var json = self.model.toJSON();
      json.income_str = HMDA.game.dollarize(json.income);
      json.current_player = 'current-' + HMDA.game.get('currentPlayer');
      $(this).html(self.template(json)).fadeIn(1);

    });

    return this;

  }

});


/**
 *  Whenever a person is added to this collection, render the person view of the person
 *  at the end of this collection
 **/

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
    return this;

  }

});


/**
 *  Renders individual tiles, re-renders whenever model changes
 **/

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

  playSquare: function() {

    if (this.$el.is('.null, .city')) {
      return;
    }

    HMDA.game.trigger('loading');
    this.$el.addClass('s-waiting');

    var x = this.model.get('x'),
        y = this.model.get('y');

    $.when(this.model.getStats()).done(function(stats){

      var timeout = (HMDA.server.agencies.indexOf('static') !== -1) ? 1000 : 0;

      var acceptedPercentage = Math.floor(100 * stats.accepted / (stats.accepted + stats.rejected)),
          success = (Math.random()*100 < acceptedPercentage),
          rejectedPercentage = 100 - acceptedPercentage;

      var start = function() {
        HMDA.game.trigger('stop-loading', {success: success, accepted: acceptedPercentage, rejected: rejectedPercentage});
        if (success) {
          self.model.set('owner', HMDA.game.get('currentPlayer'), {silent: true});
          self.$el.addClass('player-' + HMDA.game.get('currentPlayer'));
        } else {
          self.model.set('owner', null);
          self.$el.addClass('null fail');
        }
      };

      window.setTimeout(start, timeout);

    });

  },

  render: function() {

    if (this.model.get('owner')) {
      this.$el.addClass('chosen');
      this.model.set('text', this.model.get('text') + '<br />' + this.model.get('owner'));
    } else if (this.model.get('type') === 'city') {
      this.$el.addClass('city city-' + HMDA.game.getRand(1, 5));
    } else if (this.model.get('type') === null) {
      this.$el.addClass('null');
    }

    this.$el.html('<span>' + this.model.get('text') + '</span>').attr('data-x', this.model.get('x')).attr('data-y', this.model.get('y'));

    return this;

  }

});


/**
 *  Board view renders a collection of squares
 **/

HMDA.views.board = Backbone.View.extend({

  el: '#board',

  events: {

  },

  initialize: function() {

    _.bindAll(this, 'render');
    this.populate();
    this.render();

  },


  getNeighbors: function(row, col) {
    //  Odd rows are off kilter. Account for that
    var odd_offset = row % 2 * -1;
    var pairs = [[-1, odd_offset], [-1, odd_offset + 1],
                [0, -1], [0, 1],
                [1, odd_offset], [1,odd_offset + 1]];
    var neighbors = [];
    var matrix = this.matrix;
    _.each(pairs, function(pair) {
        var mod_row = row + pair[0];
        var mod_col = col + pair[1];
        if (matrix[mod_row] && matrix[mod_row][mod_col]) {
            neighbors.push(matrix[mod_row][mod_col]);
        }
    });
    return neighbors;
  },

  nearCity: function(row, col) {
    var neighbors = this.getNeighbors(row, col);
    var cities = [];
    _.each(neighbors, function(neighbor) {
      if (neighbor.model.get('type') === 'city') {
        cities.push(neighbor);
      }
    });
    return hasCity;
  },

  populate: function() {
    this.matrix = [];

    var row, col, model;

    for (row = 0; row < this.collection.height; row += 1) {

      this.matrix[row] = [];

      var row_width = this.collection.width;

      for (col = 0; col < row_width; col += 1) {

        model = new HMDA.models.square({x:col, y:row});
        //  This is a goodly range, but not very fun. Tweak it here
        //  var value = HMDA.game.getRand(75000, 275000);
        var value = HMDA.game.getRand(100000, 275000);
        model.set('type', 'home');
        model.set('value', value);
        model.set('text', HMDA.game.dollarize(value));
        this.matrix[row][col] = new HMDA.views.square({
          model: model
        });

      }

    }

    //  Now, flip some tiles to cities
    for (row = 0; row < this.matrix.length; row += 1) {

      for (col = 0; col < this.matrix[row].length; col += 1) {

        model = this.matrix[row][col].model;

        if (!HMDA.game.getRand(0, 8) && this.nearbyCities(row,col).length < 2) {
          model.set('type', 'city');
          model.set('text', model.getCity());
        }

      }

    }
    //  Check every tile is playable
    for (row = 0; row < this.matrix.length; row += 1) {
      for (col = 0; col < this.matrix[row].length; col += 1) {
        model = this.matrix[row][col].model;
        if (model.get('type') === 'home' && !this.nearbyCities(row, col).length && !HMDA.game.getRand(0,4)) {
            model.set('type', 'city');
            model.set('text', model.getCity());
        }
      }
    }
    //  Final pass through, nulling out any locations still far from
    //  cities
    for (row = 0; row < this.matrix.length; row += 1) {
      for (col = 0; col < this.matrix[row].length; col += 1) {
        model = this.matrix[row][col].model;
        if (model.get('type') === 'home' && !this.nearbyCities(row, col).length){
            model.set('type', null);
            model.set('text', '');
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

  },

  maxOwner: function(owners) {
    var max_owner = null;
    var max_count = 0;
    for (var i = 0; i < owners.length; i += 1) {
      var owner_count = owners[i];
      if (owner_count > max_count) {
        max_count = owner_count;
        max_owner = i;
      } else if (owner_count === max_count) {
        //  tie, so null out the owner
        max_owner = null;
      }
    }
    return max_owner;
  },
  cityOwner: function(row, col) {
    var owners = [HMDA.game.get('numPlayers')];
    _.each(this.getNeighbors(row, col), function(sq){
      if (sq.model.get('owner')) {
        if (!owners[sq.model.get('owner')]) {
          owners[sq.model.get('owner')] = 0;
        }
        owners[sq.model.get('owner')] += 1;
      }
    });
    return this.maxOwner(owners);
  },

  points: function() {

    var numOwned = [HMDA.game.get('numPlayers')];
    //  Fill with zeros
    for (var i = 0; i < numOwned.length; i += 1) {
      numOwned[i] = 0;
    }
    for (var row = 0; row < this.matrix.length; row += 1) {
      for (var col = 0; col < this.matrix[row].length; col += 1) {
        if (this.matrix[row][col].model.get('type') === 'city') {
          var owner = this.cityOwner(row, col);
          if (owner) {
            if (!numOwned[owner-1]) {
              numOwned[owner-1] = 0;
            }
            numOwned[owner-1] += 1;
          }
        }
      }
    }

    return numOwned;
  }

});


/**
 *  When the DOM loads, do this stuff
 **/

$(function(){

  HMDA.game = new HMDA.models.game();

});

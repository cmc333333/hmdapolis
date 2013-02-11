var HMDA = HMDA || {
  models: {},
  views: {},
  collections: {}
};

HMDA.models.game = Backbone.Model.extend({

  defaults: {
    turn: 0,
    player: 0
  }

});

HMDA.models.player = Backbone.Model.extend({

  defaults: {
    score: 0,
    income: 0,
    year: 0,
    agency: ''
  },

  initialize: function() {
    this.incrementTurn();
  },

  incrementTurn: function() {
    var turn = HMDA.game.get('turn');
    HMDA.game.set('turn', turn + 1);
  }

});

HMDA.collections.players = Backbone.Collection.extend({

  model: HMDA.models.player

});

HMDA.models.square = Backbone.Model.extend({

  defaults: {
    type: 'home',
    value: '',
    owner: undefined,
    x: 1,
    y: 1
  },

  cities: new Array('Los Angeles', 'Chicago', 'Dallas', 'NYC', 'Spokane', 'Baltimore', 'Albany', 
          'Austin', 'New Orleans', 'Grand Rapids', 'San Francisco', 'Boston', 'Seattle', 'Atlanta'),

  getCity: function () {
    return this.cities.splice(Math.floor(Math.random() * this.cities.length), 1);
  },

  getRand: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  dollarize: function(n) {
    return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  getStats: function() {
    $.getJSON('http://192.168.53.16:8180?callback=?', function(data){
    });
  }

});

HMDA.collections.squares = Backbone.Collection.extend({

  width: 7,
  height: 7

});

HMDA.views.player = Backbone.View.extend({

  tagName: 'div',

  events: {

  },

  template: function(player) {
    //return _.template('<div><%= name %></div><div>Income: <%= income %></div><div>Agency: <%= agency %><div>', player);
    //console.log(player);
    return _.template($('#player-stats').html(), player);
  },

  initialize: function() {
    //this.render();
  },

  render: function() {
    //console.log(this.model);
    //this.model.set('id', this.model.cid);
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});

// players collection views
HMDA.views.players = Backbone.View.extend({

  el: '.profile',

  initialize: function() {
    this.collection.on('add', this.addOne, this);
  },

  addOne: function(model){
    var playerView = new HMDA.views.player({model: model});
    this.$el.append(playerView.render().el);
  },

  render: function() {
    //console.log(this.collection);
    this.collection.each(this.addOne, this);
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
        model.set('value', model.dollarize(model.getRand(
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
        if (!model.getRand(0, 8)) {
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
  HMDA.players = new HMDA.collections.players([
    //new HMDA.models.player({name: 'Player 1', income: 120000, year: 2003, agency: 'HUD'}),
    new HMDA.models.player({income: 70000, year: 2006, agency: 'CFPB'})
  ]);
  HMDA.squares = new HMDA.collections.squares({model: new HMDA.models.square});
  HMDA.board = new HMDA.views.board({collection: HMDA.squares});
  HMDA.playersView = new HMDA.views.players({collection: HMDA.players});

  $('#players').append(HMDA.playersView.render().el);

});

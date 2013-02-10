var HMDA = HMDA || {
  models: {},
  views: {},
  collections: {}
};

HMDA.models.player = Backbone.Model.extend({

  defaults: {
    name: 'Player 1',
    score: 0,
    income: 0,
    agency: '',
    race: 'Cherokee'
  }

});

HMDA.collections.players = Backbone.Collection.extend({

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
      console.log(data);
    });
  }

});

HMDA.collections.squares = Backbone.Collection.extend({

  width: 8,
  height: 9

});

HMDA.views.player = Backbone.View.extend({

  tagName: 'li',

  events: {

  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(this.model.get('name'));
  }

});

HMDA.views.square = Backbone.View.extend({

  tagName: 'li',

  events: {
    'click': 'playSquare'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'populate', 'playSquare');
    this.populate();
  },

  populate: function() {
    if (!this.model.getRand(0, 8)) {
      this.model.set('type', 'city');
      this.model.set('value', this.model.getCity());
    } else {
      this.model.set('type', 'home');
      this.model.set('value', this.model.dollarize(this.model.getRand(50000, 500000)));
    }
    this.render();
  },

  getNeighbors: function(x, y) {

    var findSquare = function(x, y) {
      return 'li[data-x="' + x + '"][data-y="' + y + '"]';
    };

    var $square = $(findSquare(x, y)),
        isEvenRow = $square.parents('ul.even').length > 0 ? true : false,
        s1, s2, s3, s4, s5, s6;

    if (isEvenRow === true) {
      s1 = findSquare(x - 1, y - 1);
      s2 = findSquare(x, y - 1);
      s3 = findSquare(x + 1, y);
      s4 = findSquare(x, y + 1);
      s5 = findSquare(x - 1, y + 1);
      s6 = findSquare(x - 1, y);
    } else {
      s1 = findSquare(x, y - 1);
      s2 = findSquare(x + 1, y - 1);
      s3 = findSquare(x + 1, y);
      s4 = findSquare(x + 1, y + 1);
      s5 = findSquare(x, y + 1);
      s6 = findSquare(x - 1, y);
    }

    var neighbors = new Array($(s1), $(s2), $(s3), $(s4), $(s5), $(s6));

    return neighbors;

  },

  playSquare: function() {
    //console.log(this.model.get('x') + ' ' + this.model.get('y'));
    var x = this.model.get('x'),
        y = this.model.get('y');

    _.each(this.getNeighbors(x, y), function(item){
      item.fadeOut();
    });

    //$(s1).find('span').css('background-color', 'blue');

    //
    /*
    this.model.getStats();
    var p = prompt('Player name');
    if (p === 'null') {
      this.model.set('type', null);
      this.model.set('value', 'X');
    } else {
      this.model.set('owner', p);
    }
    this.render();
    */
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
    this.populate_board();
    this.render();
  },

    populate_board: function() {
        this.matrix = new Array();
        for (var row = 0; row < this.collection.height; row += 1) {
            this.matrix[row] = Array();
            for (var col = 0; col < this.collection.width; col += 1) {
                this.matrix[row][col] = new HMDA.views.square({
                    model: new HMDA.models.square({x:col, y:row})
                });
            }
        }
    },

  render: function() {
    for (var row = 0; row < this.collection.height; row += 1) {
        var row_ul = document.createElement('ul');
        var width = (row % 2 === 0) ? 
                    this.collection.width - 1: this.collection.width;
        var stripe = (row % 2 === 0) ? 'odd': 'even';
        row_ul.className = 'row ' + stripe;
        for (var col = 0; col < width; col += 1) {
            row_ul.appendChild(this.matrix[row][col].el);
        }
        this.$el.append(row_ul);
    }
  }

});

$(function(){

  var p = prompt('How many players will be playing?');
  for (var i = 0; i < p; i += 1) {
    HMDA.players = new HMDA.collections.players({model: new HMDA.models.player});
  }
  HMDA.squares = new HMDA.collections.squares({model: new HMDA.models.square});
  HMDA.board = new HMDA.views.board({collection: HMDA.squares});

});

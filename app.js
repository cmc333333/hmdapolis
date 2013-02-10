var HMDA = HMDA || {
  models: {},
  views: {},
  collections: {}
};

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
  }

});

HMDA.collections.squares = Backbone.Collection.extend({

  width: 8,
  height: 9

});

HMDA.views.square = Backbone.View.extend({

  tagName: 'td',

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

  render: function() {
    if (this.model.get('owner')) {
      this.$el.addClass('chosen');
      this.model.set('value', this.model.get('value') + '<br />' + this.model.get('owner'));
    } else if (this.model.get('type') === 'city') {
      this.$el.addClass('city');
    } else if (this.model.get('type') === null) {
      this.$el.addClass('null');
    }
    this.$el.html(this.model.get('value'));
    return this;
  },

  playSquare: function() {
    //console.log(this.model.toJSON())
    var p = prompt('Player name');
    if (p === 'null') {
      this.model.set('type', null);
      this.model.set('value', 'X');
    } else {
      this.model.set('owner', p);
    }
    this.render();
  }

});

HMDA.views.board = Backbone.View.extend({

  el: 'table',

  events: {

  },

  initialize: function() {
    _.bindAll(this, 'render');
    this.render();
  },

  render: function() {

    for (var i = 0; i < this.collection.height; i += 1) {
      var row = document.createElement('tr');
      for (var j = 0; j < this.collection.width; j += 1) {
        var square = new HMDA.views.square({model: new HMDA.models.square({x:i,y:j})});
        console.log(square.model.get('x') + ' ' + square.model.get('y'));
        row.appendChild(square.el);
      }
      this.$el.append(row);
    }

  }

});

$(function(){

  HMDA.squares = new HMDA.collections.squares({model: new HMDA.models.square});
  HMDA.board = new HMDA.views.board({collection: HMDA.squares});

});
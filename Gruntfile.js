/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    meta: {
      version: '0.1.0'
    },
    banner:
      '/*          /$$$$$$          /$$      \n' +
      '           /$$__  $$        | $$      \n' +
      '  /$$$$$$$| $$  )__//$$$$$$ | $$$$$$$ \n' +
      ' /$$_____/| $$$$   /$$__  $$| $$__  $$\n' +
      '| $$      | $$_/  | $$  ) $$| $$  ) $$\n' +
      '| $$      | $$    | $$  | $$| $$  | $$\n' +
      '|  $$$$$$$| $$    | $$$$$$$/| $$$$$$$/\n' +
      ' (_______/|__/    | $$____/ |_______/ \n' +
      '                  | $$                \n' +
      '                  | $$                \n' +
      '                  |__/                */\n\n' +
      '/*! HMDAPOLIS - v<%= meta.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* http://consumerfinance.gov/\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      'Consumer Financial Protection Bureau; Licensed Apache 2.0 */\n\n',
    // Task configuration.
    recess: {
      dist: {
        // form-builder.less is @imported in bootstrap.less
        src: ['<%= banner %>', 'static/css/font-awesome.css', 'static/css/hmdapolis.css'],
        dest: 'static/css/hmdapolis.min.css',
        options: {
          compile: true,
          compress: true
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: ['static/js/jquery-1.9.0.min.js', 'static/js/underscore.js', 'static/js/backbone.js', 'static/js/highcharts.js', 'static/js/hmdapolis.js'],
        dest: 'static/js/hmdapolis.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        multistr: true,
        browser: true,
        globals: {
          jQuery: true,
          $: true,
          Backbone: true,
          _: true,
          Highcharts: true
        }
      },
      all: ['Gruntfile.js', 'static/js/hmdapolis.js']
    },
    jasmine: {
      src: '<%= uglify.dist.src %>',
      options: {
        specs: 'specs/*.js'
      }
    },
    watch: {
      gruntfile: {
        files: ['Gruntfile.js', '<%= recess.dist.src %>', '<%= uglify.dist.src %>', '<%= jasmine.options.specs %>'],
        tasks: ['default']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Let's create a useful test command.
  grunt.registerTask('test', ['jshint', 'jasmine']);

  // Default task.
  grunt.registerTask('default', ['test', 'recess', 'uglify']);

};

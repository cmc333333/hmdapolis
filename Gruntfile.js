/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    meta: {
      version: '0.1.0'
    },
    banner: '/*! HMDAPOLIS - v<%= meta.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* http://consumerfinance.gov/\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      'CFPB; Licensed Apache 2.0 */\n',
    // Task configuration.
    recess: {
      dist: {
        // form-builder.less is @imported in bootstrap.less
        src: ['<%= banner %>', 'static/css/font-awesome.css', 'static/css/style.css'],
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
        src: ['static/js/jquery-1.9.0.min.js', 'static/js/underscore.js', 'static/js/backbone.js', 'static/js/highcharts.js', 'static/js/app.js'],
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
        browser: true,
        globals: {
          jQuery: true
        }
      },
      all: ['Gruntfile.js', 'static/css/style.css', 'static/js/app.js']
    },
    watch: {
      gruntfile: {
        files: ['<%= recess.dist.src %>', '<%= uglify.dist.src %>'],
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

  // Default task.
  grunt.registerTask('default', ['recess', 'uglify']);

};

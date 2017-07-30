module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      dist: {
        files:[{
          expand: true,
          src: ['js/*.js'],
          dest: 'public'
        }]
      }
    }
  });

  // Load the plugin that provides the "browserify" task.
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', [
    'browserify'
  ]);

};

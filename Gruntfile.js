module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    filename: 'index.html',

    browserify: {
      dist: {
        files:[{
          expand: true,
          src: ['js/*.js'],
          dest: 'public'
        }]
      }
    },

    htmlbuild: {
      dist: {
        expand: true,
        src: 'layout.html',
        dest: 'public',
        rename: (dest, src) => {
          return dest + '/<%= filename %>';
        },
        options: {
          beautify: true,
          sections: {
            body: 'html/<%= filename %>'
          },
          data: {
          }
        }
      }
    },

    copyright: '(c) Eugene Valeyev'
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-html-build');

  // Default task(s)
  grunt.registerTask('default', [
    'browserify',
    'htmlbuild'
  ]);

};

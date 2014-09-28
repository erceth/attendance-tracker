module.exports = function(grunt) {
    grunt.initConfig({
      concat: {
        options: {
          separator: ';',
        },
        dist: {
          src: ['public/js/**/*.js'],
          dest: 'public/main.js',
        }
      },
      
      watch: {
        scripts: {
          files: ['public/js/**/*.js'],
          tasks: ['concat', 'wiredep'],
          options: {
            spawn: false,
          },
        },
      },
      
      wiredep: {

      target: {
        src: [
        'public/index.html' //where to add scripts
        ],
        directory: "public/bower_components"
      
         
        }
      }
      
      
    }); //end grunt initConfig


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-wiredep');
    
    grunt.registerTask('default', ['concat', 'wiredep' , 'watch']);

};
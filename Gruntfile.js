'use strict'; // eslint-disable-line

/*eslint strict: 0, camelcase: 0 */

module.exports = function(grunt) {

  grunt.initConfig({

    dir: {
      webapp: 'webapp',
      dist: 'dist',
      bower_components: 'bower_components'
    },

    connect: {
      options: {
        port: 8080,
        hostname: '*'
      },
      src: {},
      dist: {}
    },

    openui5_connect: {
      options: {
        resources: [
          '<%= dir.bower_components %>/openui5-sap.ui.core/resources',
          '<%= dir.bower_components %>/openui5-sap.m/resources',
          '<%= dir.bower_components %>/openui5-sap.ui.layout/resources',
          '<%= dir.bower_components %>/openui5-themelib_sap_belize/resources'
        ]
      },
      src: {
        options: {
          appresources: '<%= dir.webapp %>'
        }
      },
      dist: {
        options: {
          appresources: '<%= dir.dist %>'
        }
      }
    },

    openui5_preload: {
      component: {
        options: {
          resources: {
            cwd: '<%= dir.dist %>',
            prefix: 'todo'
          },
          dest: '<%= dir.dist %>'
        },
        components: true
      }
    },

    clean: {
      dist: '<%= dir.dist %>/'
    },

    copy: {
      dist: {
        files: [ {
          expand: true,
          cwd: '<%= dir.webapp %>',
          src: [
            '**',
            "!*.js"
          ],
          dest: '<%= dir.dist %>'
        } ]
      }
    },

    eslint: {
      webapp: ['<%= dir.webapp %>']
    },

    ts: {
      default : {
        tsconfig: {
          tsconfig: 'tsconfig.json',
          passThrough: true,
          watch: "."
        }
      },
      // watch : {
      //   tsconfig: {
      //     tsconfig: 'tsconfig.json',
      //     passThrough: true,
      //     watch: "webapp"
      //   }
      // }
    },

    // tslint: {
    //   options: {
    //     configuration: "tslint.json"
    //   }
    // },

    availabletasks: {
      tasks: {
        options: {
          filter: 'exclude',
          tasks: ['availabletasks', 'tasks']
        }
      }
    },

    babel: {
      // options: {
      //   sourceMap: false,
      //   // presets: ['env']
      // },
      dist: {
        files: [
          {
            expand: true,
            cwd: '.build/tsc-out',
            src: ['**/*.js'],
            dest: 'dist/'
          }
        ]
      }
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-openui5');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-ts');
  // grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-available-tasks');

  // Server task
  grunt.registerTask('serve', function(target) {
    grunt.task.run('openui5_connect:' + (target || 'src') + ':keepalive');
  });

  // Linting task
  grunt.registerTask('lint', ['eslint']);

  // Build task
  grunt.registerTask('build', ['ts', 'babel', 'openui5_preload', 'copy']);
  // grunt.registerTask('build', ['ts', 'babel', 'copy']);

  grunt.registerTask('tasks', ['availabletasks']);

  // Default task
  grunt.registerTask('default', [
    'lint',
    'clean',
    'build',
    'serve:dist'
  ]);
};

/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;*/\n',
    // Task configuration.

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['public/js/<%= pkg.name %>.js'],
        dest: 'deploy/public/js<%= pkg.name %>.<%= pkg.version %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      clientjs: {
        src: '<%= concat.dist.dest %>',
        dest: 'deploy/public/js<%= pkg.name %>.<%= pkg.version %>.min.js'
      }
    },

    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      gruntfile: {
        src: ['Gruntfile.js']
      },
      client: {
        src: ['public/js/{,**/}*.js', '!public/js/vendor/{,**/}*.js']
      },
      spec: {
        options: {
          browser: true,
          undef: false
        },
        src: 'spec/{,**/}*.js'
      }
    },

    compass: {
      options: {
        sassDir: 'src/sass',
        cssDir: 'public/css',
        imagesDir: 'public/img',
        javascriptsDir: 'public/js',
        outputStyle: 'expanded',
        noLineComments: false,
        force: false
      },
      dev: {
        options: {
          debugInfo: false
        }
      },
      build: {
        options: {
          noLineComments: true,
          debugInfo: false
        }
      }
    },

    connect: {
      site: {
        options: {
          port: 3001,
          hostname: '*',
          base: ['public'],
          directory: 'public',
          // keepalive: false,
          debug: true,
          livereload: 3002,
          open: true
        }
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        browsers: ['PhantomJS'],
        reporters: ['progress']
      // },
      // integration: {
      // },
      // functional: {
      }
    },

    bower: {
      client: {
        dest: 'src/sass/vendor',
        js_dest: 'public/js/vendor',
        css_dest: 'public/css/vendor',
        options: {
          ignorePackages: ['jasmine']
        }
      }
    },

    responsive_images: {
      backgrounds: {
        options: {
          newFilesOnly: true,
          sizes: [
            {name: 'xlarge-2x', width: 3264, quality: 30},
            {name: 'xlarge-1x', width: 1632, quality: 30},
            {name: 'large-2x', width: 2560, quality: 30},
            {name: 'large-1x', width: 1280, quality: 30},
            {name: 'medium-2x', width: 1536, quality: 30},
            {name: 'medium-1x', width: 768, quality: 30},
            {name: 'small-2x', width: 960, quality: 30},
            {name: 'small-1x', width: 480, quality: 30}
          ]
        },
        files: [{
          expand: true,
          cwd: 'src/img/original/',
          src: '{,**/}*',
          dest: 'src/img/resized'
        }]
      }
    },

    imagemin: {
      backgrounds: {
        files: [{
          expand: true,
          cwd: 'src/img/resized/',
          src: '{,**/}*',
          dest: 'public/img'
        }]
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile'],
        options: {
          reload: true
        }
      },
      clientjs: {
        files: '<%= jshint.client.src %>',
        tasks: ['jshint:client', 'karma'],
        options: {
          livereload: true
        }
      },
      spec: {
        files: '<%= jshint.spec.src %>',
        tasks: ['jshint:spec', 'karma']
      },
      livereload: {
        options: {
          livereload: '<%= connect.site.options.livereload %>'
        },
        files: 'public/{,**/}*'
      },
      compass: {
        files: 'src/sass/{,**/}*.{sass,scss}',
        tasks: ['compass:dev']
      },
      image_resize: {
        files: 'src/img/original/{,**/}*',
        tasks: ['newer:responsive_images:backgrounds']
      },
      image_opt: {
        files: 'src/img/resized/{,**/}*',
        tasks: ['newer:imagemin:backgrounds']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-newer');

  // Default task.
  grunt.registerTask('default', ['bower', 'compass:dev', 'imageprep','jshint', 'karma:unit', 'connect:site',
      'watch']);
  grunt.registerTask('imageprep', ['newer:responsive_images:backgrounds', 'newer:imagemin:backgrounds']);

};

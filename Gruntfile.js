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
        src: 'public/js/<%= pkg.title || pkg.name %>.js',
        dest: 'deploy/public/js<%= pkg.version %>.<%= pkg.version %>-<%= pkg.version %>.min.js'
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
           debug: true
        }
      },
      dist: {
        files: {
          'public/js/<%= pkg.title || pkg.name %>.js': ['src/js/main.js'],
          'src/js/polyfill/browserify/require.bs.js': ['src/js/polyfill/browserify/require.js']
        }
      }
    },

    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      gruntfile: {
        src: ['Gruntfile.js']
      },
      client: {
        src: ['src/js/{,**/}*.js', '!src/js/{vendor,polyfill}/{,**/}*.js']
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
          hostname: '127.0.0.1',
          base: ['public'],
          directory: 'public',
          debug: true,
          livereload: 3002,
          open: true,
          middleware: function (/*connect, options, middlewares*/) {
            var middlewares = arguments[2];
            middlewares.unshift(require('grunt-connect-proxy/lib/utils').proxyRequest);
            return middlewares;
          }
        },
        proxies: [{
          context: '/contact/send_mail.php',
          host: '<%= php.mailserver.options.hostname %>',
          port: '<%= php.mailserver.options.port %>',
          rewrite: {
            '^/foo': ''
          }
        }]
      }
    },

    php: {
      mailserver: {
        options: {
          hostname: '127.0.0.1',
          port: 3003,
          base: 'public'
        }
      }
    },

    karma: {
      options: {
        files:[
          'src/js/polyfill/{,**/}*.js',
          'spec/unit/{,**/}*.js'
        ],
        port: 9876,
        singleRun: true,
        browsers: [],
        reporters: [],
        logLevel: 'INFO',
        frameworks: ['browserify', 'jasmine-ajax', 'jasmine'],
        preprocessors: {
          'spec/unit/{,**/}*.js': [ 'browserify' ],
          'src/js/{,lib/**/}*.js': ['coverage']
        },
        coverageReporter: {
          type : 'html',
          dir : 'artifacts/coverage/'
        },
        browserify: {
          debug: true
        },
        colors: true,
        autoWatch: false
      },
      unit: {
        browsers: ['PhantomJS'],
        reporters: ['progress']
      }
    },

    bower: {
      client: {
        dest: 'src/sass/vendor',
        js_dest: 'src/js/vendor',
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
        tasks: ['jshint:client', 'karma', 'browserify'],
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

  grunt.task.registerTask('cleanup', 'Cleans up tmp files', function () {
    grunt.log.writeln('Cleaning up now');
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-php');

  // Default task.
  grunt.registerTask('default', ['bower', 'compass:dev', 'imageprep', 'test', 'browserify', 'serve',
      'watch', 'cleanup']);

  // sub tasks
  grunt.registerTask('serve', ['php:mailserver', 'configureProxies:site', 'connect:site']);
  grunt.registerTask('imageprep', ['newer:responsive_images:backgrounds', 'newer:imagemin:backgrounds']);
  grunt.registerTask('test', ['jshint', 'karma:unit']);

};

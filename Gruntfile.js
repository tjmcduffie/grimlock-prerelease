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
        httpImagesPath: '/img',
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
      favicon: {
        options: {
          newFilesOnly: false,
          sizes: [
            {name: '32', width: 32, quality: 32},
            {name: '57', width: 57, quality: 57},
            {name: '72', width: 72, quality: 72},
            {name: '96', width: 96, quality: 96},
            {name: '120', width: 120, quality: 120},
            {name: '128', width: 128, quality: 128},
            {name: '144', width: 144, quality: 144},
            {name: '152', width: 152, quality: 152},
            {name: '195', width: 195, quality: 195},
            {name: '228', width: 228, quality: 228}
          ]
        },
        files: [{
          expand: true,
          cwd: 'src/img/to-resize/favicon/',
          src: '{,**/}*',
          dest: 'src/img/to-optimize/favicon'
        }]
      },
      content: {
        options: {
          newFilesOnly: false,
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
          cwd: 'src/img/to-resize/work',
          src: '{,**/}*',
          dest: 'src/img/to-optimize/work'
        }]
      }
    },

    imagemin: {
      all: {
        files: [{
          expand: true,
          cwd: 'src/img/to-optimize',
          src: '{,**/}*.{png,jpg,gif}',
          dest: 'public/img'
        }]
      }
    },

    copy: {
      deploy: {
        files: [{
          expand: true,
          src: ['public/**', 'vendor/**', 'src/**'],
          dest: 'deploy/build'
        }]
      },
      release: {
        src: 'deploy/build',
        dest: '<%= grunt.template.today("yyyy-mm-dd-hh::MM::ss") %>-v<%= pkg.version %>'
      }
    },

    clean: {
      deploy: ['deploy/build'],
    },

    bump: {
      options: {
        prereleaseName: 'rc'
      }
    },

    prompt: {
      bump: {
        options: {
          questions: [{
            config: 'deploy.bump',
            type: 'list',
            message: 'What type of release are you creating?',
            choices: ['patch', 'minor', 'major', 'prerelease', 'prepatch', 'preminor', 'premajor', 'git']
          }]
        }
      },
      deploy: {
        options: {
          questions: [{
            config: 'deploy.env',
            type: 'list',
            message: 'What environment are you releasing to?',
            choices: ['dev', 'prod']
          },{
            config: 'scp.options.username',
            type: 'input',
            message: 'Please enter the username for hte remote machine.'
          }]
        }
      }
    },

    scp: {
      options: {
        hostname: 'tmcduffie.com'
      },
      prod: {
        files: [{
          cwd: 'deploy/<%= copy.release.dest %>',
          src: '**/*',
          dest: '~/timmcduffie.com/prerelease/<%= copy.release.dest %>'
        }]
      },
      dev: {
        files: [{
          cwd: 'deploy/<%= copy.release.dest %>',
          src: '**/*',
          dest: '~/dev.timmcduffie.com/prerelease/<%= copy.release.dest %>'
        }]
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        report: 'gzip',
        screwIE8: true,
        compress: {
          drop_console: true,
          dead_code: true,
          drop_debugger: true,
          warnings: true
        }
      },
      clientjs: {
        files: {
          'deploy/public/js/<%= pkg.title || pkg.name %>-<%= pkg.version %>.min.js':
              ['deploy/public/js/<%= pkg.title || pkg.name %>.js']
        }
      }
    },

    cssmin: {
      options: {
        report: 'gzip'
      },
      css: {
        files: {
          'deploy/public/css/<%= pkg.title || pkg.name %>-<%= pkg.version %>.min.css':
              ['deploy/public/css/ben.css']
        }
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
        files: 'src/img/to-resize/{,**/}*{png,jpg,gif}',
        tasks: ['newer:responsive_images']
      },
      image_opt: {
        files: 'src/img/to-optimize/{,**/}*{png,jpg,gif}',
        tasks: ['newer:imagemin']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-php');
  grunt.loadNpmTasks('grunt-prompt');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-scp');

  // Default task.
  grunt.registerTask('default', ['bower', 'compass:dev', 'imageprep', 'test', 'browserify', 'serve',
      'watch', 'cleanup']);

  // sub tasks
  grunt.registerTask('serve', ['php:mailserver', 'configureProxies:site', 'connect:site']);
  grunt.registerTask('imageprep', ['newer:responsive_images', 'newer:imagemin']);
  grunt.registerTask('test', ['jshint', 'karma:unit']);

  grunt.registerTask('deploy', function () {
    var version;
    grunt.task.run('prompt', 'clean:deploy');
    // if (grunt.config('deploy.env' === 'prod')) {
    //   deploy.env
    // }
    bump = 'bump:' + grunt.config('deploy.bump');
    scp = 'scp:'  + grunt.config('deploy.env');
    grunt.task.run(bump, 'copy:deploy', 'cssmin', 'uglify', 'copy:release');
    grunt.log.writeln('running ' + scp);
  });

  grunt.registerTask('promptbump', function () {
    var version;
    grunt.task.run('prompt:bump');
    version = grunt.config('deploy.bump');
    grunt.log.writeln('running bump:' + version);
    grunt.task.run('bump:' + version);
  });

};


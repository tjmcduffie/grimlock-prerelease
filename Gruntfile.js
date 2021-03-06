/*global module:false*/
var fs = require('fs');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;*/\n',

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

    browserify: {
      options: {
        browserifyOptions: {
           debug: true
        }
      },
      dist: {
        files: {
          'public/js/main.js': ['src/js/main.js']
        }
      }
    },

    bump: {
      options: {
        prereleaseName: 'rc',
        pushTo: 'origin'
      }
    },

    clean: {
      build: ['deploy/build'],
      unnecessary: [
        // 'deploy/build/public/{css,js}',
        'deploy/build/public/index.php',
        'deploy/build/src/{img,js,sass}'
      ]
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

    config: {
      deploy: {
        root: 'deploy/build/public',
        js: {
          filename: '<%= pkg.title || pkg.name %>-<%= pkg.version %>.min.js',
          path: '<%= config.deploy.root %>/js/'
        },
        css: {
          filename: '<%= pkg.title || pkg.name %>-<%= pkg.version %>.min.css',
          path: '<%= config.deploy.root %>/css/'
        }
      }
    },

    connect: {
      site: {
        options: {
          port: 3001,
          hostname: '*',
          base: 'public',
          debug: false,
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

    copy: {
      deploy: {
        files: [{
          expand: true,
          src: ['public/**', 'vendor/**', 'src/**'],
          dest: 'deploy/build'
        }]
      },
      release: {
        files: [{
          expand: true,
          cwd: 'deploy/build',
          src: '{,**/}*',
          dest: 'deploy/v<%= grunt.file.readJSON("package.json").version %>'
        }]
      }
    },

    cssmin: {
      options: {
        report: 'gzip'
      }
    },

    filerev: {
      options: {

      },
      images: {
        src: '<%= config.deploy.root %>/img/{,**/}*.{png,gif,jpg,jpeg}'
      },
      css: {
        src: '<%= config.deploy.root %>/css/{,**/}*.css'
      },
      js: {
        src: '<%= config.deploy.root %>/js/{,**/}*.js'
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
          undef: false,
          unused: false,
          jasmine: true
        },
        src: 'spec/unit/{,**/}*.js'
      },
      e2e: {
        options: {
          browser: true,
          undef: false,
          unused: false,
          jasmine: true,
          globals: {
            xdescribe: true,
            xit: true,
            protractor: true,
            browser: true,
            by: true,
            element: true
          }
        },
        src: '<%= protractor.options.args.specs %>'
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

    php: {
      mailserver: {
        options: {
          hostname: '127.0.0.1',
          port: 3003,
          base: 'public'
        }
      }
    },

    pkg: grunt.file.readJSON('package.json'),

    prompt: {
      bump: {
        options: {
          questions: [{
            config: 'bump.options.versionType',
            type: 'list',
            message: 'What type of release are you creating?',
            choices: ['patch', 'minor', 'major', 'prerelease', 'prepatch', 'preminor', 'premajor', 'git']
          }]
        }
      },
      deploy: {
        options: {
          questions: [{
            config: 'sshconfig.santoro.host',
            type: 'input',
            message: 'Please enter the hostname of the server to deploying to'
          },{
            config: 'sshconfig.santoro.username',
            type: 'input',
            message: 'Please enter the username for the remote machine.'
          },{
            config: 'sshconfig.santoro.password',
            type: 'password',
            message: 'Please enter the password for the remote machine.'
          },{
            config: 'sftp.options.releaseDir',
            type: 'list',
            message: 'Choose a version to deploy',
            choices: fs.readdirSync('./deploy')
          },{
            config: 'protractor.deploy.options.args.baseUrl',
            type: 'list',
            message: 'Choose the environment to test',
            choices: ['http://www.timmcduffie.com', 'http://dev.timmcduffie.com']
          }]
        }
      },
      configure: {
        options: {
          questions: [{
            config: 'config.secret.email.host',
            type: 'input',
            message: 'Please enter the hostname of the mail server'
          }, {
            config: 'config.secret.email.username',
            type: 'input',
            message: 'Please enter the SMTP account username'
          }, {
            config: 'config.secret.email.password',
            type: 'password',
            message: 'Please enter the SMTP account password'
          }, {
            config: 'config.secret.email.fromemail',
            type: 'input',
            message: 'Please enter the email address from which the message will send'
          }, {
            config: 'config.secret.email.recipient',
            type: 'input',
            message: 'Please enter the email address of the recipient'
          }]
        }
      },
      preview: {
        options: {
          questions: [{
            config: 'preview.dir',
            type: 'list',
            message: 'Choose a version to preview',
            choices: fs.readdirSync('./deploy').filter(function(elem) { return elem !== 'build';})
          }]
        }
      }
    },

    protractor: {
      options: {
        configFile: 'protractor-e2e.js',
        keepAlive: false,
        args: {
          baseUrl: 'http://127.0.0.1:3001/',
          specs: [ 'spec/integration/*/*' ],
          includeStackTrace: true,
          verbose: false,
          browser: 'chrome'
        }
      },
      e2e: {
        options: {}
      },
      build: {
        options: {
          args: {
            baseUrl: 'http://127.0.0.1:3006/',
            specs: [ 'spec/integration/*/*' ],
            browser: 'chrome'
          }
        }
      },
      deploy: {
        options: {
          args: {
            baseUrl: 'http://dev.timmcduffie.com',
            specs: [ 'spec/integration/*/*' ],
            browser: 'chrome'
          }
        }
      }
    },

    responsive_images: {
      favicon: {
        options: {
          newFilesOnly: true,
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
          cwd: 'src/img/to-resize/work',
          src: '{,**/}*',
          dest: 'src/img/to-optimize/work'
        }]
      }
    },

    sftp: {
      options: {
        config: 'santoro',
        showProgress: true,
        releaseDir: 'build',
        createDirectories: true,
        srcBasePath: 'deploy/'
      },
      santoro: {
        options: {
          path: '/home/tjmcduff/<%= sshconfig.santoro.host %>/prerelease'
        },
        files: {
          './': 'deploy/<%= sftp.options.releaseDir %>/{,**/}*'
        }
      }
    },

    sshconfig: {
      'santoro': {
        host: '',
        username: '',
        password: ''
      }
    },

    sshexec: {
      options: {
        config: 'santoro'
      },
      symlinkSite: {
        command: ['sh -c "cd <%= sshconfig.santoro.host %>; rm site; ln -s ' +
            'prerelease/<%= sftp.options.releaseDir %>/public site;"']
      },
      symlinkLogs: {
        command: ['sh -c "cd <%= sshconfig.santoro.host %>; cd prerelease/<%= sftp.options.releaseDir %>; ' +
            'ln -s ../../logs logs;"']
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
      }
    },

    usemin: {
      html: '<%= config.deploy.root %>/{,**/}*.html',
      html_srcset: '<%= usemin.html %>',
      options: {
        patterns: {
          html_srcset: [
            // [
            //   /<img[^\>]*[^\>\S]+srcset=['"]([^"']+)["']/gm,
            //   'Update the HTML with the new img filenames'
            // ],
            [
              /<source[^\>]+srcset=['"]([^,"']+)((, )[^,"']+( \dx))["']/gm,
              // /<source[^\>]+srcset=['"]((, )?([^, "']+( x[\d])?)["']/gm,
              'Update the HTML with the new source filenames'
            ]
          ]
        }
      }
    },

    useminPrepare: {
      html: '<%= config.deploy.root %>/{,**/}*.html',
      options: {
        dest: '<%= config.deploy.root %>',
        staging: '<%= config.deploy.root %>',
        root: 'public'
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
        tasks: ['jshint:client', 'karma:unit', 'browserify'],
        options: {
          livereload: true
        }
      },
      e2e: {
        files: '<%= jshint.e2e.src %>',
        tasks: ['jshint:e2e', 'protractor:e2e']
      },
      spec: {
        files: '<%= jshint.spec.src %>',
        tasks: ['jshint:spec', 'karma:unit']
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
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-php');
  grunt.loadNpmTasks('grunt-prompt');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-ssh');

  grunt.registerTask('config', function () {
    try {
      grunt.config.set('config.secret', grunt.file.readJSON('src/config/config.json'));
    } catch (e) {
      grunt.task.run(['prompt:configure', 'write-config']);
    }
  });

  grunt.registerTask('write-config', function () {
    var data = grunt.config.get('config.secret');
    console.log(data);
    grunt.file.write('src/config/config.json', JSON.stringify(data));
  });

  grunt.registerTask('preview-build', function () {
    grunt.config.set('connect.build', grunt.config.get('connect.site'));
    grunt.config.set('connect.build.options.base', 'deploy/build/public');
    grunt.config.set('connect.build.options.keepalive', true);
    grunt.config.set('connect.build.options.livereload', false);
    grunt.config.set('connect.build.options.port', grunt.config.get('connect.build.options.port') + 5);
    grunt.task.run(['php:mailserver', 'configureProxies:build', 'connect:build']);
  });

  grunt.registerTask('preview-release', function () {
    grunt.config.set('connect.preview', grunt.config.get('connect.site'));
    grunt.config.set('connect.preview.options.base', '<%= config.deploy.root %>');
    grunt.config.set('connect.preview.options.keepalive', true);
    grunt.config.set('connect.preview.options.livereload', false);
    grunt.config.set('connect.preview.options.port', grunt.config.get('connect.preview.options.port') + 5);
    grunt.task.run(['prompt:preview', 'php:mailserver', 'configureProxies:preview', 'connect:preview']);
  });

  grunt.registerTask('default', ['bower', 'compass:dev', 'newer:responsive_images', 'newer:imagemin',
      'test', 'browserify', 'php:mailserver', 'configureProxies:site', 'connect:site', 'watch']);

  grunt.registerTask('test', ['jshint', 'karma:unit']);

  grunt.registerTask('test-e2e', ['protractor:e2e']);

  grunt.registerTask('create-build', ['clean:build', 'copy:deploy', 'clean:unnecessary',
      'useminPrepare', 'concat:generated', 'cssmin:generated','uglify:generated', /*'filerev',*/ 'usemin']);

  grunt.registerTask('build', ['create-build', 'preview-build', 'protractor:build']);

  grunt.registerTask('release', ['prompt:bump', 'bump', 'create-build', 'copy:release']);

  grunt.registerTask('deploy', ['prompt:deploy', 'sftp:santoro', 'sshexec:symlinkSite',
      'sshexec:symlinkLogs', 'protractor:deploy']);

};


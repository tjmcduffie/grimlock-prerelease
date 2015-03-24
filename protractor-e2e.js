// An example configuration file.
exports.config = {

  seleniumServerJar: './node_modules/grunt-protractor-runner/node_modules/protractor/selenium/' +
      'selenium-server-standalone-2.41.0.jar',

  chromeDriver: './node_modules/grunt-protractor-runner/node_modules/protractor/selenium/chromedriver',

  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  framework: 'jasmine',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    isVerbose: true,
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  onPrepare: function() {
    browser.ignoreSynchronization = true;
  }
};

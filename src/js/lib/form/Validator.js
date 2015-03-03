/* jshint browser:true */
'use strict';

var Validator = function () {
};


Validator.isRequired = function (element) {
  return element.required ? true : false;
};


Validator.isPopulated = function (element) {
  if (!element.value) {
    return false;
  }

  if (typeof element.value === 'string' && String.prototype.trim.call(element.value) === '') {
    return false;
  }

  return true;
};


Validator.hasPattern = function (element) {
  return (element.pattern || Validator.typePatterns[element.type]) ? true : false;
};


Validator.isMatchingPattern = function (element) {
  var pattern = (element.pattern || Validator.typePatterns[element.type]);

  if (!pattern) {
    console.log('no pattern available to test value against');
    return true;
  }

  return pattern.test(element.value);
};


Validator.patterns = {
  EMAIL: /[a-z0-9-_.]{1,255}@[a-zA-Z0-9-_.]{1,255}\.[a-z]{2,10}(\.[a-z]{2,10})?/i
};

Validator.typePatterns = {
  'email': Validator.patterns.EMAIL
};


module.exports = Validator;

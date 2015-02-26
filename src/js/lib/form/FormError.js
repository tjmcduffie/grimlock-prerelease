'use strict';

var FormError = function(type, message, elem) {
  this.type = type;
  this.message = message || this.getMessageForType_();
  this.elem = elem;
};

FormError.types = {
  REQUIREMENT: 'requirement',
  PATTERN: 'pattern',
  SERVER: 'server',
  UNEXPECTED: 'unexpected'
};

FormError.messages = {
  REQUIREMENT: 'This field is required.',
  PATTERN: 'This field is not in an acceptable format',
  SERVER: 'The server was unable to process the request. Please try again.',
  UNEXPECTED: 'An unexpected error occurred'
};

FormError.prototype.getMessageForType_ = function () {
  for (var key in FormError.types) {
    if (FormError.types.hasOwnProperty(key)) {
      if (FormError.types[key] === this.type) {
        return FormError.messages[key];
      }
    }
  }
};

module.exports = FormError;
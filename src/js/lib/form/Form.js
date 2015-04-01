'use strict';

var EventEmitter = require('events').EventEmitter;
var Validator = require('./Validator');
var FormError = require('./FormError');


var Form = function (formElement) {
  this.elem = formElement;
  this.errors = [];

  this.inputs_ = this.elem.querySelectorAll('input, textarea, select');
  this.eventEmitter_ = new EventEmitter();

  this.elem.addEventListener('submit', this.handleSubmit_.bind(this));
};

Form.events = {
  HANDLE_SUBMIT: 'submit.init',
  VALIDATE_SUCCESS: 'validate.success',
  VALIDATE_FAIL: 'validate.fail'
};

Form.prototype.handleSubmit_ = function (e) {
  this.errors = [];
  this.eventEmitter_.emit(Form.events.HANDLE_SUBMIT, e);

  if (!this.isValid_()) {
    e.preventDefault();
    this.reportErrors_();
    return;
  }

  this.eventEmitter_.emit(Form.events.VALIDATE_SUCCESS, e);
};

Form.prototype.isValid_ = function() {
  Array.prototype.map.call(this.inputs_, function(elem) {
    var type = null;

    if (Validator.isRequired(elem) && !Validator.isPopulated(elem)) {
      type = FormError.types.REQUIREMENT;
    } else if (Validator.hasPattern(elem) && !Validator.isMatchingPattern(elem)) {
      type = FormError.types.PATTERN;
    }

    if (type) {
      this.errors.push(new FormError(type, elem.dataset.errorMessage, elem));
    }
  }.bind(this));
  return this.errors.length === 0 ? true : false;
};

Form.prototype.reportErrors_ = function () {
    this.eventEmitter_.emit(Form.events.VALIDATE_FAIL);
};

Form.prototype.on = function (event, callback) {
  this.eventEmitter_.addListener(event, callback);
  return this;
};

Form.prototype.destroy = function () {
  this.elem.removeEventListener('submit');
  this.elem.remove();
};

module.exports = Form;

/* jshint browser:true */
/* global Validator, EventEmitter */
'use strict';

/**
 * @require Q
 * @require form.Validator
 * @require event.EventEmitter
 */

var Form = function (formElement) {
  this.elem = formElement;
  this.errors = [];

  this.inputs_ = this.elem.querySelectorAll('input, textarea, select');
  this.eventEmitter_ = new EventEmitter();

  this.elem.addEventListener('submit', this.handleSumbit_.bind(this));
};

Form.events = {
  HANDLE_SUBMIT: 'handle-submit',
  // SUBMIT_SUCCESS: 'submit.success',
  // SUBMIT_FAIL: 'submit.fail',
  VALIDATE_SUCCESS: 'validate.success',
  VALIDATE_FAIL: 'validate.fail'
};

Form.prototype.handleSumbit_ = function (e) {
  e.preventDefault();
  this.errors = [];
  this.eventEmitter_.broadcast(Form.events.HANDLE_SUBMIT, [e]);

  if (!this.isValid_()) {
    e.preventDefault();
    this.reportErrors_();
    return;
  }

  this.eventEmitter_.broadcast(Form.events.VALIDATE_SUCCESS, [e]);
};

Form.prototype.isValid_ = function() {
  console.log('validating');
  Array.prototype.map.call(this.inputs_, function(elem) {
    var type = null;

    if (Validator.isRequired(elem) && !Validator.isPopulated(elem)) {
      type = 'required';
    } else if (Validator.hasPattern(elem) && !Validator.isMatchingPattern(elem)) {
      type = 'pattern';
    }

    if (type) {
      this.errors.push({
        type: type,
        elem: elem,
        message: elem.dataset.errorMessage || ''
      });
    }
  }.bind(this));
  return this.errors.length === 0 ? true : false;
};

Form.prototype.reportErrors_ = function () {
    this.eventEmitter_.broadcast(Form.events.VALIDATE_FAIL);
};

Form.prototype.on = function (event, callback) {
  this.eventEmitter_.listen(event, callback);
  return this;
};



// var AjaxForm = function (formElement) {
//   this.promise_ = Q.defer();
// };

// AjaxForm.prototype.submitHandler = function (e) {
//   e.preventDefault();
//   console.log('submitting form');
//   if (this.isValid_()) {
//     var xhr = new XMLHttpRequest()
//   }
// }

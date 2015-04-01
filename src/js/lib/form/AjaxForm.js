/* jshint browser:true */
'use strict';


var Form = require('./Form');
var FormError = require('./FormError');


var AjaxForm = function (formElement) {
  this.Super_.call(this, formElement);

  this.response = undefined;
  this.xhr_ = undefined;
  this.url_ = formElement.getAttribute('action');
  this.method_ = formElement.getAttribute('method');
};


AjaxForm.events = Form.events;
AjaxForm.events.SUBMIT_SUCCESS = 'submit.success';
AjaxForm.events.SUBMIT_FAIL = 'submit.fail';


AjaxForm.prototype = Object.create(Form.prototype);
AjaxForm.prototype.constructor = AjaxForm;
AjaxForm.prototype.Super_ = Form;


AjaxForm.prototype.handleSubmit_ = function (e) {
  e.preventDefault(e);

  this.Super_.prototype.handleSubmit_.call(this, e);

  if (this.errors.length === 0) {
    this.xhr_ = new XMLHttpRequest();
    this.xhr_.onreadystatechange = this.handleReadyStateChange_.bind(this);
    this.xhr_.open(this.method_, this.url_);
    this.xhr_.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.xhr_.send(this.getFormData_());
  }
};

AjaxForm.prototype.handleReadyStateChange_ = function () {
  if (this.xhr_.readyState === 4) {
    this.parseXhrResponseValue_();

    if (this.response) {
      this.parseXhrResponseErrors_();

      if (this.xhr_.status === 200 && this.errors.length === 0) {
        this.eventEmitter_.emit(AjaxForm.events.SUBMIT_SUCCESS);
        return;
      }
    }

    this.eventEmitter_.emit(AjaxForm.events.SUBMIT_FAIL);
  }
};

AjaxForm.prototype.parseXhrResponseErrors_ = function () {
  if (this.response) {
    if (Array.isArray(this.response.errors)) {
      this.errors = this.response.errors.map(function(value) {
        return new FormError(FormError.types.SERVER, value);
      });
    }
  }

  if (this.xhr_.status !== 200) {
    this.errors.shift(new FormError(FormError.types.UNEXPECTED));
  }

  if (this.errors.length > 0) {
    console.log(this.errors);
  }
};

AjaxForm.prototype.parseXhrResponseValue_ = function () {
  try {
    this.response = JSON.parse(this.xhr_.responseText);
  } catch (err) {
    this.errors.push(new FormError(FormError.types.UNEXPECTED));
    console.log(err);
  }
};

AjaxForm.prototype.getFormData_ = function () {
  var data = '';
  Array.prototype.forEach.call(this.inputs_, function(element) {
    if (data !== '') {
      data += '&';
    }
    data += encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value);
  });
  return data;
};

AjaxForm.prototype.destroy = function () {
  if (this.xhr_.readyState < 4) {
    this.xhr_.abort();
  }
  this.Super_.prototype.destroy.call(this);
};

module.exports = AjaxForm;
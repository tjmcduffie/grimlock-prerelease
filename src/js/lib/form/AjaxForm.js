/* jshint browser:true */
'use strict';


var Form = require('./Form');


var AjaxForm = function (formElement) {
  Form.call(this, formElement);

  this.url_ = formElement.getAttribute('action');
  this.method_ = formElement.getAttribute('method');
};


AjaxForm.events = Form.events;
AjaxForm.events.SUBMIT_SUCCESS = 'submit.success';
AjaxForm.events.SUBMIT_FAIL = 'submit.fail';


AjaxForm.prototype = Object.create(Form.prototype);
AjaxForm.prototype.constructor = AjaxForm;
AjaxForm.prototype.Super_ = Form;


AjaxForm.prototype.handleSumbit_ = function (e) {
  var xhr;
  e.preventDefault(e);
  this.Super_.prototype.handleSumbit_.call(this, e);

  if (this.errors.length === 0) {
    xhr = new XMLHttpRequest();
  }
};

module.exports = AjaxForm;
'use strict';

/**
 * @TODO Mock out dependencies used in Browserify
 */
describe('Form', function () {

  var AjaxForm = require('../../../../src/js/lib/form/AjaxForm');

  var mockFormElement = (function() {
    var f = document.createElement('form');
    var elements = [
      { tag: 'input', type: 'text', name: 'simple'},
      { tag: 'input', type: 'text', name: 'required', required: true},
      { tag: 'input', type: 'text', name: 'notrequired', required: false},
      { tag: 'input', type: 'text', name: 'required-pattern', required: true, pattern: '/foo/'},
      { tag: 'input', type: 'text', name: 'required-pattern-msg', required: true, pattern: '/foo/',
          'data-error-message': 'this is an error'},
      { tag: 'input', type: 'text', name: 'required-msg', required: true, 'data-error-message':
          'this is an error'},
      { tag: 'input', type: 'text', name: 'msg-only', 'data-error-message': 'this is an error'},
      { tag: 'input', type: 'submit', name: 'submit-btn'}
    ];
    elements.forEach(function (conf) {
      var input = document.createElement(conf.tag);
      input.setAttribute('name', conf.name);
      if (conf.name) { input.setAttribute('name', conf.name); }
      if (conf.type) { input.setAttribute('type', conf.type); }
      if (conf.required) { input.setAttribute('required', conf.required); }
      if (conf.pattern) { input.setAttribute('pattern', conf.pattern); }
      if (conf['data-error-message']) { input.setAttribute('data-error-message',
          conf['data-error-message']); }
      f.appendChild(input);
    });
    f.setAttribute('method', 'POST');
    f.setAttribute('action', 'http://example.com/');
    f.remove = function () {};
    f.removeEventListener = function () {};
    f.addEventListener = function () {};
    return f;
  }());

  var mockForm, formSpies, ajaxFormSpies, ajaxSpies, formConstructorSpy;

  beforeEach(function () {
    console.log(typeof AjaxForm.prototype.Super_.prototype.handleSubmit_);
    console.log(typeof AjaxForm.prototype.Super_.prototype.isValid_);
    console.log(typeof AjaxForm.prototype.Super_.prototype.reportErrors_);
    console.log(typeof AjaxForm.prototype.Super_.prototype.on);
    console.log(typeof AjaxForm.prototype.Super_.prototype.destroy);

    formConstructorSpy = spyOn(AjaxForm.prototype, 'Super_').and.callThrough()
    // {
    //   constructor: spyOn(AjaxForm.prototype, 'Super_').and.callThrough(),
    //   // submit: spyOn(AjaxForm.prototype.Super_.prototype, 'handleSubmit_'),
    //   // validate: spyOn(AjaxForm.prototype.Super_.prototype, 'isValid_'),
    //   // report: spyOn(AjaxForm.prototype.Super_.prototype, 'reportErrors_'),
    //   // on: spyOn(AjaxForm.prototype.Super_.prototype, 'on'),
    //   // destroy: spyOn(AjaxForm.prototype.Super_.prototype, 'destroy')
    // };

    formSpies = jasmine.createSpyObj('Form.protptype', ['handleSubmit_', 'isValid_', 'reportErrors_',
        'on', 'destroy']);

    AjaxForm.prototype.Super_.prototype =  {
      submit: spyOn(AjaxForm.prototype, 'handleSubmit_'),
      readyStateChange: spyOn(AjaxForm.prototype, 'handleReadyStateChange_'),
      responseErrors: spyOn(AjaxForm.prototype, 'parseXhrResponseErrors_'),
      responseValue: spyOn(AjaxForm.prototype, 'parseXhrResponseValue_'),
      getData: spyOn(AjaxForm.prototype, 'getFormData_'),
      destroy: spyOn(AjaxForm.prototype, 'destroy')
    };

    ajaxSpies = {
      open: spyOn(XMLHttpRequest.prototype, 'open'),
      setRequestHeader: spyOn(XMLHttpRequest.prototype, 'setRequestHeader'),
      send: spyOn(XMLHttpRequest.prototype, 'send')
    };

    mockForm = new AjaxForm(mockFormElement);
    mockFormElement.reset();

    spyOn(mockForm.eventEmitter_, 'emit');
    spyOn(mockForm.eventEmitter_, 'addListener');
  });

  describe('extraxcts basic information from the form and calls through to its super class', function () {
    it('should call the Super constructor', function () {
      expect(formSpies.constructor).toHaveBeenCalled;
    });

    it('should set a containers for the xhr object', function () {
      expect(mockForm.hasOwnProperty('xhr_')).toBe(true);
      expect(mockForm.xhr_).toBe(undefined);
    });

    it('should set a containers for the xhr response', function () {
      expect(mockForm.hasOwnProperty('response')).toBe(true);
      expect(mockForm.response).toBe(undefined);
    });

    it('should extract the data needed to make the request', function () {
      expect(mockForm.url_).toBe('http://example.com/');
      expect(mockForm.method_).toBe('POST');
    });
  });

});
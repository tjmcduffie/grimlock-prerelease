'use strict';

/**
 * @TODO Mock out dependencies used in Browserify
 */
describe('Form', function () {
  // var proxyquire =  require('proxyquire');
  var Validator = jasmine.createSpyObj('Validator', ['isRequired', 'isMatchingPattern', 'isPopulated',
      'hasPattern']);

  // var Form = proxyquire('../../../../src/js/lib/form/Form', {'./Validator': Validator});
  var Form = require('../../../../src/js/lib/form/Form');

  var mockFormElement = (function() {
    var f = document.createElement('form');
    var elements = [
      { tag: 'input', type: 'text', name: 'simple'},
      { tag: 'input', type: 'text', name: 'required', required: true},
      { tag: 'input', type: 'text', name: 'notrequired', required: false},
      { tag: 'input', type: 'text', name: 'pattern-only', pattern: '/foo/'},
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
    f.remove = function () {};
    f.removeEventListener = function () {};
    f.addEventListener = function () {};
    return f;
  }());

  var mockForm, formSpies;

  beforeEach(function () {
    formSpies = {
      submit: spyOn(Form.prototype, 'handleSubmit_'),
      validate: spyOn(Form.prototype, 'isValid_'),
      report: spyOn(Form.prototype, 'reportErrors_')
    };

    spyOn(mockFormElement, 'remove');
    spyOn(mockFormElement, 'removeEventListener');
    spyOn(mockFormElement, 'addEventListener');

    mockForm = new Form(mockFormElement);
    mockFormElement.reset();

    spyOn(mockForm.eventEmitter_, 'emit');
    spyOn(mockForm.eventEmitter_, 'addListener');
  });

  describe('extraxcts basic information from the form and sets a submit listener', function () {
    it('should set the root DOM element', function () {
      expect(mockForm.elem).toBe(mockFormElement);
    });

    it('should set up an empty container for errors', function () {
      expect(mockForm.errors.length).toBe(0);
    });

    it('should listen to form submit events', function () {
      expect(mockFormElement.addEventListener).toHaveBeenCalledWith('submit', jasmine.any(Function));
    });
  });

  describe('when submitted', function () {
    var e = {
      type: 'submit',
      preventDefault: function () {}
    };

    it('should communicate success when requirements are met', function () {
    });

    it('should communicate failure when errors are present', function () {
      formSpies.submit.and.callThrough();
      formSpies.validate.and.returnValue(false);
      mockForm.handleSubmit_(e);
      expect(mockForm.eventEmitter_.emit).toHaveBeenCalledWith(Form.events.HANDLE_SUBMIT, e);
      expect(Form.prototype.reportErrors_).toHaveBeenCalled();
      expect(mockForm.eventEmitter_.emit).not.toHaveBeenCalledWith(Form.events.VALIDATE_SUCCESS, e);
    });

  });

  // @TODO need to mock out the Validator object so these tests can be run correctly
  // right now these tests fail for multiple reasons
  xit('should check for valid data in all elements', function () {
    var inputs = mockFormElement.querySelectorAll('[name]');
    inputs = Array.prototype.filter.call(inputs, function (elem) {
      return elem.getAttribute('type') !== 'submit';
    });
    formSpies.validate.and.callThrough();

    Array.prototype.forEach.call(inputs, function (elem) {
      elem.setAttribute('value', '');
    });
    expect(mockForm.isValid_()).toBe(false);



    Array.prototype.forEach.call(inputs, function (elem) {
      elem.setAttribute('value', 'foo');
      console.log(elem.name + ', (' + typeof elem.pattern + ') ' + elem.pattern + ' ' + typeof elem.pattern.test);
    });

    expect(mockForm.isValid_()).toBe(true);
    expect(Validator.isRequired).toHaveBeenCalled();
    expect(Validator.isPopulated).toHaveBeenCalled();
    expect(Validator.hasPattern).toHaveBeenCalled();
    expect(Validator.isMatchingPattern).toHaveBeenCalled();
  });

  it('should emit an event when reporting errors', function () {
    formSpies.report.and.callThrough();
    mockForm.reportErrors_();
    expect(mockForm.eventEmitter_.emit).toHaveBeenCalledWith(Form.events.VALIDATE_FAIL);
  });

  it('should emit an event an return itself when alowing external object to bind to it', function () {
    var noop = function () {};
    var result = mockForm.on('foo', noop);
    expect(mockForm.eventEmitter_.addListener).toHaveBeenCalledWith('foo', noop);
    expect(result).toBe(mockForm);
  });

  it('should provide a method of destruction for cleanup', function () {
    mockForm.destroy();
    expect(mockFormElement.remove).toHaveBeenCalled();
    expect(mockFormElement.removeEventListener).toHaveBeenCalledWith('submit');
  });

});
/* jshint unused:false */
/* global describe, xdescribe, it, xit, expect, beforeEach, afterEach */
'use strict';

describe('FormError', function () {

  var FormError = require('../../../../src/js/lib/form/FormError');

  var type = 'this is the type';
  var message = 'this is the message';
  var element = document.createElement('input');

  it('normalizes formatting of form errors', function () {
    var err = new FormError(type, message, element);

    expect(err.type).toBe(type);
    expect(err.message).toBe(message);
    expect(err.elem).toBe(element);
  });

  describe('populates default messages for known types', function () {
    it('including REQUIREMENT', function () {
      var err = new FormError(FormError.types.REQUIREMENT);
      expect(err.message).toBe(FormError.messages.REQUIREMENT);
    });
    it('including PATTERN', function () {
      var err = new FormError(FormError.types.PATTERN);
      expect(err.message).toBe(FormError.messages.PATTERN);
    });
    it('including SERVER', function () {
      var err = new FormError(FormError.types.SERVER);
      expect(err.message).toBe(FormError.messages.SERVER);
    });
    it('including UNEXPECTED', function () {
      var err = new FormError(FormError.types.UNEXPECTED);
      expect(err.message).toBe(FormError.messages.UNEXPECTED);
    });
  });

  describe('overrides default messages when receiving a custom message', function () {
    it('including REQUIREMENT', function () {
      var err = new FormError(FormError.types.REQUIREMENT, 'foo');
      expect(err.message).not.toBe(FormError.messages.REQUIREMENT);
      expect(err.message).toBe('foo');
    });
    it('including PATTERN', function () {
      var err = new FormError(FormError.types.PATTERN, 'foo');
      expect(err.message).not.toBe(FormError.messages.PATTERN);
      expect(err.message).toBe('foo');
    });
    it('including SERVER', function () {
      var err = new FormError(FormError.types.SERVER, 'foo');
      expect(err.message).not.toBe(FormError.messages.SERVER);
      expect(err.message).toBe('foo');
    });
    it('including UNEXPECTED', function () {
      var err = new FormError(FormError.types.UNEXPECTED, 'foo');
      expect(err.message).not.toBe(FormError.messages.UNEXPECTED);
      expect(err.message).toBe('foo');
    });
  });
});
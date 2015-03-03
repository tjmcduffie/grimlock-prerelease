/* jshint unused:false */
/* global describe, xdescribe, it, xit, expect, beforeEach, afterEach */
'use strict';

describe('The Validator class tests objects representing form elements', function () {

  var Validator = require('../../../../src/js/lib/form/Validator');

  it('it checks whether a field is required', function () {
    expect(Validator.isRequired({required: true})).toEqual(true);
    expect(Validator.isRequired({required: undefined})).toEqual(false);
    expect(Validator.isRequired({required: false})).toEqual(false);
    expect(Validator.isRequired({required: ''})).toEqual(false);
  });

  it('it checks if a required field is populated', function () {
    expect(Validator.isPopulated({value: 'something'})).toEqual(true);
    expect(Validator.isPopulated({value: ''})).toEqual(false);
    expect(Validator.isPopulated({value: ' '})).toEqual(false);
    expect(Validator.isPopulated({value: '      '})).toEqual(false);
    expect(Validator.isPopulated({value: false})).toEqual(false);
    expect(Validator.isPopulated({})).toEqual(false);
  });

  it('it checks whether a field has a pattern', function () {
    expect(Validator.hasPattern({pattern: true})).toEqual(true);
    expect(Validator.hasPattern({pattern: /(.*)/})).toEqual(true);
    expect(Validator.hasPattern({pattern: undefined})).toEqual(false);
    expect(Validator.hasPattern({pattern: ''})).toEqual(false);
  });

  it('it checks if a field with a pattern matches that pattern', function () {
    expect(Validator.isMatchingPattern({pattern: /.*/, value: 'test'})).toEqual(true);
    expect(Validator.isMatchingPattern({pattern: /te/, value: 'test'})).toEqual(true);
    expect(Validator.isMatchingPattern({pattern: /te/, value: 'retest'})).toEqual(true);
    expect(Validator.isMatchingPattern({pattern: undefined, value: 'test'})).toEqual(true);
    expect(Validator.isMatchingPattern({pattern: /te/, value: undefined})).toEqual(false);
    expect(Validator.isMatchingPattern({pattern: /te/, value: ''})).toEqual(false);
    expect(Validator.isMatchingPattern({pattern: /te/, value: 'foo'})).toEqual(false);
  });

  describe('provides common patterns', function () {
    it('for email addresses', function () {
      expect(Validator.patterns.EMAIL.test('foo@bar.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo-bar@bar.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo.bar@bar.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo_bar@bar.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo@foo-bar.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo@foo.bar.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo@foo_bar.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('1@1.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo@1.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('1@foo.com')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo@bar.co.uk')).toEqual(true);
      expect(Validator.patterns.EMAIL.test('foo@barcom')).toEqual(false);
      expect(Validator.patterns.EMAIL.test('@bar.com')).toEqual(false);
      expect(Validator.patterns.EMAIL.test('foo-bar.com')).toEqual(false);
      expect(Validator.patterns.EMAIL.test('foo.bar.com')).toEqual(false);
      expect(Validator.patterns.EMAIL.test('foo_bar.com')).toEqual(false);

    });
  });
});
'use strict';

describe('The contact form allows the user to contact me', function () {
  var valuesHash = {
    name: 'PROTRACTOR user',
    email: 'contact@timmcduffie.com',
    message: 'This is a test from PROTRACTOR.'
  };
  var contact, form, inputName, inputEmail, textareaMessage, inputsFilled;

  beforeEach(function () {
    browser.driver.manage().window().setSize(1000, 3000);
    browser.get('/index.html');
    contact = element(by.id('contact'));
    form = contact.element(by.tagName('form'));
    inputName = form.element(by.id('name'));
    inputEmail = form.element(by.id('email'));
    textareaMessage = form.element(by.id('message'));
    inputsFilled = {
      name: false,
      email: false,
      message: false
    };
  });

  describe('Its fields should have initial values', function() {
    it('name should be empty', function () {
      inputName.getText().then(function (text) {
        expect(text).toBe('');
      });
    });
    it('email should be empty', function () {
      inputEmail.getText().then(function (text) {
        expect(text).toBe('');
      });
    });
    it('message should be empty', function () {
      textareaMessage.getText().then(function (text) {
        expect(text).toBe('');
      });
    });
  });

  describe('It provides feedback on successful submission', function () {
    it('The form should be replaced with a new header and message', function () {
      inputName.sendKeys(valuesHash.name).then(function () {
        inputEmail.sendKeys(valuesHash.email).then(function () {
          textareaMessage.sendKeys(valuesHash.message).then(function () {
            form.submit().then(function () {
              browser.driver
                .wait(protractor.until.elementLocated(by.css('#contact h3')), 3000,
                    'The form success title did not appear.')
                .then(function (arg1) {
                  var h3 = contact.element(by.tagName('h3'));
                  h3.isDisplayed().then(function (isDisplayed) {
                    expect(isDisplayed).toBe(true);
                  });
                  h3.getText().then(function (text) {
                    expect(text).toBe('Your email has been sent.');
                  });
                  expect(contact.all(by.tagName('form')).count()).toBe(0);
                });
            });
          });
        });
      });
    });
  });

  describe('It provides feedback on failed submission', function () {
    beforeEach(function () {
      inputName.sendKeys(valuesHash.name);
      inputEmail.sendKeys(valuesHash.email);
      textareaMessage.sendKeys(valuesHash.message);
    });

    it('failure occurs when the name is missing', function () {
      var errorMsg;
      inputName.getAttribute('data-error-message').then(function (value) {
        errorMsg = value;
      });
      inputName.clear().then(function () {
        form.submit().then(function () {
          element.all(by.css('.errors li')).first().getText().then(function (text) {
            expect(text).toBe(errorMsg);
          });
        });
      });
    });

    it('failure occurs when the email is missing', function () {
      var errorMsg;
      inputEmail.getAttribute('data-error-message').then(function (value) {
        errorMsg = value;
      });
      inputEmail.clear().then(function () {
        form.submit().then(function () {
          element.all(by.css('.errors li')).first().getText().then(function (text) {
            expect(text).toBe(errorMsg);
          });
        });
      });
    });

    it('failure occurs when the email is malformed', function () {
      var errorMsg;
      inputEmail.getAttribute('data-error-message').then(function (value) {
        errorMsg = value;
      });
      inputEmail.clear().then(function () {
        inputEmail.sendKeys('foobar').then(function () {
          form.submit().then(function () {
            element.all(by.css('.errors li')).first().getText().then(function (text) {
              expect(text).toBe(errorMsg);
            });
          });
        });
      });
    });

    it('failure occurs when the message is missing', function () {
      var errorMsg;
      textareaMessage.getAttribute('data-error-message').then(function (value) {
        errorMsg = value;
      });
      textareaMessage.clear().then(function () {
        form.submit().then(function () {
          element.all(by.css('.errors li')).first().getText().then(function (text) {
            expect(text).toBe(errorMsg);
          });
        });
      });
    });
  });
});
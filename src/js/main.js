/* jshint browser:true */
'use strict';


/**
 * Nav animator
 */
var Nav = require('./lib/ui/nav');

var nav = new Nav(document.querySelector('.header'), '.hamburger', 'nav', 'expanded');


/**
 * parallax scroller
 */
var ParallaxScroller = require('./lib/ui/ParallaxScroller');

var trigger = document.getElementById('title').querySelector('h1');
var target = document.querySelector('.header header');
var elemStartY = target.parentElement.offsetHeight - (target.offsetTop - target.parentElement.offsetTop);

var headerParallax = new ParallaxScroller(target, {
    elemStartY: elemStartY,
    elemEndY: 0,
    scrollListenerStartY: trigger.offsetTop - target.parentElement.offsetHeight,
    scrollListenerEndY: trigger.offsetTop + trigger.offsetHeight
});

headerParallax.setRecipientOffset(elemStartY);


/**
 * Form Validation and submission.
 */
var Form = require('./lib/form/AjaxForm');
var contactFormErrors = require('./templates/contact-form-errors');
var contactFormSuccess = require('./templates/contact-form-success');

var contactForm = new Form(document.querySelector('#contact form'));
contactForm
    .on(Form.events.HANDLE_SUBMIT, function () {
        console.log('handling sumbission');
        var sibling = this.elem.previousElementSibling;
        if (sibling.tagName === 'UL' && sibling.className === 'errors') {
            sibling.remove();
        }
    }.bind(contactForm))

    .on(Form.events.VALIDATE_FAIL, function () {
        console.log('validation failed');
        var errorsList = contactFormErrors(this.errors);
        this.elem.parentNode.insertBefore(errorsList, this.elem);
    }.bind(contactForm))

    .on(Form.events.SUBMIT_FAIL, function () {
        console.log('submission failed');
        var errorsList = contactFormErrors(this.errors);
        this.elem.parentNode.insertBefore(errorsList, this.elem);
    }.bind(contactForm))

    .on(Form.events.SUBMIT_SUCCESS, function () {
        console.log('submission succeeded');
        var successMessage = contactFormSuccess();
        contactForm.elem.parentElement.insertBefore(successMessage, contactForm.elem);
        contactForm.destroy();
    });


/**
 * Expose Publicly
 */
var TMCD = {
  nav: nav,
  header: headerParallax,
  form: contactForm
};

if (window) {
    window.TMCD = TMCD;
}

module.exports = TMCD;

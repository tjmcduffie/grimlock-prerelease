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

var contactForm = new Form(document.querySelector('#contact form'));
contactForm
    .on(Form.events.HANDLE_SUBMIT, function () {
        // clear
        console.log('clearing errors');
        console.dir(this.elem.previousElementSibling);
        console.log(this.elem.previousElementSibling.tagName === 'UL' &&
            this.elem.previousElementSibling.className === 'errors');
        if (this.elem.previousElementSibling.tagName === 'UL' &&
            this.elem.previousElementSibling.className === 'errors') {
            this.elem.previousElementSibling.remove();
        }

    }.bind(contactForm))
    .on(Form.events.VALIDATE_FAIL, function () {
        console.log('validation failed with errors', this.errors);

        // this should render a template instead of generate a string.
        var errorsList = contactFormErrors(this.errors);
        this.elem.parentNode.insertBefore(errorsList, this.elem);

    }.bind(contactForm));


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

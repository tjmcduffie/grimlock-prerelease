/* jshint browser:true */
'use strict';

var scrollToElement = require('../animation/scroll-element-to');

var Nav = function(containerElement, triggerSelector, targetSelector, expandedClassName) {
    this.container_ = containerElement;
    this.trigger_ = this.container_.querySelector(triggerSelector);
    this.target_ = this.container_.querySelector(targetSelector);
    this.className_ = expandedClassName;

    this.trigger_.addEventListener('click', this.triggerClickHandler.bind(this));
    this.target_.addEventListener('click', this.navClickHandler.bind(this));
};

Nav.prototype.triggerClickHandler = function() {
    var n;

    // @TODO: refactor to use classList. requires classList polyfill for IE9 and below
    if (this.container_.className.indexOf(this.className_) === -1) {
        if (this.container_.className.length > 0) {
            // add it to the classlist
            n = this.container_.className.split(' ');
            n.push(this.className_);
            this.container_.className = n.join(' ');
        } else {
            // set the string value if the length is 0
            this.container_.className = this.className_;
        }

    } else {
        this.container_.className = this.container_.className.replace(this.className_, '')
                .trim();
    }
};

Nav.prototype.navClickHandler = function(e) {
    var destElem;

    if (e.target.tagName === 'A') {
        e.preventDefault();

        if (window.getComputedStyle(this.trigger_).display !== 'none') {
            this.triggerClickHandler();
        }
        destElem = document.querySelector(e.target.getAttribute('href'));
        scrollToElement(document.body, destElem.offsetTop, 1250);
    }
};

module.exports = Nav;
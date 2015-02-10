(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = function easeInOutQuad(time, start, change, duration) {
    time /= duration / 2;
    if (time < 1) {
        return change / 2 * time * time + start;
    }

    time--;
    return -change / 2 * (time * (time - 2) - 1) + start;
};

},{}],3:[function(require,module,exports){
'use strict';

var easeInOutQuad = require('./ease-in-out');


module.exports = function scrollToElement(element, to, duration) {
    var start = element.scrollTop;
    var change = to - start;
    var currentTime = 0;
    var increment = 20;

    var animate = function(){
        currentTime += increment;
        element.scrollTop = easeInOutQuad(currentTime, start, change, duration);

        if(currentTime < duration) {
            setTimeout(animate, increment);
        }
    };

    animate();
};

},{"./ease-in-out":2}],4:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var Validator = require('./Validator');


var Form = function (formElement) {
  this.elem = formElement;
  this.errors = [];

  this.inputs_ = this.elem.querySelectorAll('input, textarea, select');
  this.eventEmitter_ = new EventEmitter();

  this.elem.addEventListener('submit', this.handleSumbit_.bind(this));
};

Form.events = {
  HANDLE_SUBMIT: 'handle-submit',
  // SUBMIT_SUCCESS: 'submit.success',
  // SUBMIT_FAIL: 'submit.fail',
  VALIDATE_SUCCESS: 'validate.success',
  VALIDATE_FAIL: 'validate.fail'
};

Form.prototype.handleSumbit_ = function (e) {
  e.preventDefault();
  this.errors = [];
  this.eventEmitter_.emit(Form.events.HANDLE_SUBMIT, e);

  if (!this.isValid_()) {
    e.preventDefault();
    this.reportErrors_();
    return;
  }

  this.eventEmitter_.emit(Form.events.VALIDATE_SUCCESS, e);
};

Form.prototype.isValid_ = function() {
  console.log('validating');
  Array.prototype.map.call(this.inputs_, function(elem) {
    var type = null;

    if (Validator.isRequired(elem) && !Validator.isPopulated(elem)) {
      type = 'required';
    } else if (Validator.hasPattern(elem) && !Validator.isMatchingPattern(elem)) {
      type = 'pattern';
    }

    if (type) {
      this.errors.push({
        type: type,
        elem: elem,
        message: elem.dataset.errorMessage || ''
      });
    }
  }.bind(this));
  return this.errors.length === 0 ? true : false;
};

Form.prototype.reportErrors_ = function () {
    this.eventEmitter_.emit(Form.events.VALIDATE_FAIL);
};

Form.prototype.on = function (event, callback) {
  this.eventEmitter_.addListener(event, callback);
  return this;
};

module.exports = Form;

},{"./Validator":5,"events":1}],5:[function(require,module,exports){
/* jshint browser:true */
'use strict';

var Validator = function () {
};


Validator.isRequired = function (element) {
  return element.required ? true : false;
};


Validator.isPopulated = function (element) {
  if (!element.value) {
    return false;
  }

  if (typeof element.value === 'string' && String.prototype.trim.call(element.value) === '') {
    return false;
  }

  return true;
};


Validator.hasPattern = function (element) {
  return (element.pattern || Validator.typePatterns[element.type]) ? true : false;
};


Validator.isMatchingPattern = function (element) {
  var pattern = (element.pattern || Validator.typePatterns[element.type]);

  if (!pattern) {
    console.log('no pattern available to value against');
    return true;
  }

  return pattern.test(element.value);
};


Validator.patterns = {
  EMAIL: /[a-z0-9-_.]{1,255}@[a-zA-Z0-9-_.]{1,255}\.[a-z]{2,10}(\.[a-z]{2,10})?/i
};

Validator.typePatterns = {
  'email': Validator.patterns.EMAIL
};


module.exports = Validator;

},{}],6:[function(require,module,exports){
/* jshint browser:true */
'use strict';

var ParallaxScroller = function(elem, config) {
    this.elem_ = elem;
    this.elemStartY_ = typeof(config.elemStartY) !== 'undefined' ? config.elemStartY : 0;
    this.elemEndY_ = typeof(config.elemEndY) !== 'undefined' ? config.elemEndY :
            this.elem_.offsetHeight;
    this.scrollListenerStartY_ = config.scrollListenerStartY;
    this.scrollListenerEndY_ = config.scrollListenerEndY;
    this.speed_ = config.speed || Math.abs(this.elemEndY_ - this.elemStartY_) /
            Math.abs(this.scrollListenerEndY_ - this.scrollListenerStartY_);

    this.previousPageYOffset_ = window.pageYOffset;
    this.currentRecipientPosition_ = 0;

    window.addEventListener('scroll', this.handleScroll_.bind(this));
};

ParallaxScroller.prototype.handleScroll_ = function() {
    var position = 0;
    if (window.pageYOffset >= this.scrollListenerStartY_ &&
            window.pageYOffset <= this.scrollListenerEndY_) {
        position = this.currentRecipientPosition_ +
                ((window.pageYOffset - this.previousPageYOffset_) * -(this.speed_));
    } else if (window.pageYOffset < this.scrollListenerStartY_) {
        position = this.elemStartY_;
    } else if (window.pageYOffset > this.scrollListenerEndY_) {
        position = this.elemEndY_;
    }

    this.setRecipientOffset(position);
    this.previousPageYOffset_ = window.pageYOffset;
};

ParallaxScroller.prototype.setRecipientOffset = function(newPosition) {
    this.elem_.style.transform = 'translate3d(0, ' + newPosition + 'px, 0)';
    this.currentRecipientPosition_ = newPosition;
};

module.exports = ParallaxScroller;

},{}],7:[function(require,module,exports){
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
},{"../animation/scroll-element-to":3}],8:[function(require,module,exports){
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
var Form = require('./lib/form/Form');
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


module.exports = {
  nav: nav,
  header: headerParallax,
  form: contactForm
};

},{"./lib/form/Form":4,"./lib/ui/ParallaxScroller":6,"./lib/ui/nav":7,"./templates/contact-form-errors":9}],9:[function(require,module,exports){
/* jshint browser:true */


module.exports = function(errors) {
  var errorsList = document.createElement('ul');
  errorsList.className = 'errors';

  errors.map(function(err) {
      var name = err.elem.name.charAt(0).toUpperCase();
      var li = document.createElement('li');
      var message;

      switch (err.type) {
        case 'required':
          message = name + ' is a required field.';
          break;
        case 'pattern':
          message = err.message || 'Please enter a valid ' + name;
          break;
      }

      li.appendChild(document.createTextNode(message));
      errorsList.appendChild(li);
  });
  return errorsList;
};
},{}]},{},[8]);

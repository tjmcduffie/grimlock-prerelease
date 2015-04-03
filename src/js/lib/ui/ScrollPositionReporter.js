/* jshint browser:true */

/**
 * Constructs a ScrollPositionReporter object.
 */
var ScrollPositionReporter = function() {

  // listen to the window's scroll event.
  if (!ScrollPositionReporter.isListening_) {
    document.addEventListener('scroll', function() {
      ScrollPositionReporter.isWaiting_ = setTimeout(function() {
        clearTimeout(ScrollPositionReporter.isWaiting_);
        ScrollPositionReporter.handleWindowScroll_();
      }, ScrollPositionReporter.scrollDelay_);
    });
    ScrollPositionReporter.isListening_ = true;
  }
};

/**
 * Stores whether the scroll listener has already been attached to the DOM.
 * @type {Number}
 * @private
 */
ScrollPositionReporter.isListening_ = false;

/**
 * Object containing initial values for scroll position expressed in positive numbers.
 * @type {Object}
 * @type {Object.<number>} x Horizontal Scroll position.
 * @type {Object.<number>} y Vertical scroll position.
 * @private
 */
ScrollPositionReporter.position_ = {
  x: window.scrollX,
  y: window.scrollY
};

/**
 * Time in miliseconds to delay reporting position
 * @type {Number}
 * @private
 */
ScrollPositionReporter.scrollDelay_ = 50;

/**
 * Boolean value to determin if the object should wait before reporting.
 * @type {number?}
 * @private
 */
ScrollPositionReporter.isWaiting_ = undefined;

/**
 * Map of positions and their callbacks. Keys must be in the form of the axis + position as a positive
 * number, such as y200 or x50.
 * @type {Object}
 * @type {Object.<Array>}
 * @type {Object.<Array>.<function>}
 * @private
 */
ScrollPositionReporter.map_ = {};

/**
 * Reports position of the document expressed as a positive value by executing the
 * @return {Object} A map of X and Y scroll positions of the document represented as positive numbers.
 *                  Negative Scrolling is ignored.
 * @private
 */
ScrollPositionReporter.reportPosition_ = function() {
  var position = ScrollPositionReporter.position_;
  var callbacks = [];

  // Iterate over the props in the position object (should only be x, y) and build the callbacks array to
  // include methods that are mapped to either the x position or y position.
  for (var prop in position) {
    if (position.hasOwnProperty(prop) &&
        Object.prototype.toString.call(ScrollPositionReporter.position_) === '[object Array]') {
      var mapKey = prop + position[prop];
      if (ScrollPositionReporter.map_[mapKey]) {
        callbacks = callbacks.concat(ScrollPositionReporter.map_[mapKey]);
      }
    }
  }

  // Execute each callback retrieved from the map.
  callbacks.forEach(function(callback) {
    callback(position);
  });

  // return the current position
  return position;
};

ScrollPositionReporter.updatePosition_ = function() {
  ScrollPositionReporter.position_.x = window.scrollX;
  ScrollPositionReporter.position_.y = window.scrollY;
  return null;
};

/**
 * handles the window's scroll event.
 * @return {number} The scroll position of the document represented as a whole number. Negative Scrolling
 *                  is ignored.
 * @private
 */
ScrollPositionReporter.handleWindowScroll_ = function() {
  ScrollPositionReporter.updatePosition_();
  ScrollPositionReporter.reportPosition_();
  return null;
};

/**
 * Execute the provided callback when the page scrolls to the provided location.
 * @param  {Function} callback  Function to execute at the given location.
 * @param  {number}   position  Scroll location expressed as a posititive number. Optional.
 * @param  {string}   axis The axis to use when determining scroll position. Optional.
 * @return {null}
 */
ScrollPositionReporter.executeWhen = function(callback, position, axis) {
  // set default properties
  position = position || 0;
  axis = axis || 'y';

  // set up the map key if necessary and push the callback into the execution list
  var key = axis + position;
  if (ScrollPositionReporter.map.hasOwnProperty(key) && ScrollPositionReporter.map[key]) {
    ScrollPositionReporter.map[key] = [];
  }
  ScrollPositionReporter.map[key].push(callback);

  return null;
};

module.exports = ScrollPositionReporter;
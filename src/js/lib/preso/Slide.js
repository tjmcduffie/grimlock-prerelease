/* global EventEmitter */
/**
 * @fileoverview
 * @requires  EventEmitter
 */

/**
 * Slide constructor
 * @constructor
 */
var Slide = function () {

  /**
   * Active state property.
   * @type {Boolean}
   */
  this.isActive_ = false;

  var self = this;

  Slide.observer.listen('slide.activate', function(slide) {
    if (slide !== self) {
      self.deactivate();
    }
  });
};

Slide.observer = new EventEmitter();

/**
 * Activates the slide.
 * @return {boolean} The active state of the slide.
 */
Slide.prototype.activate = function () {
  this.isActive_ = true;
  Slide.observer.broadcast('slide.activate', this);

  return this.isActive_;
};

/**
 * Deactivates the slide.
 * @return {boolean} The active state of the slide.
 */
Slide.prototype.deactivate = function () {
  this.isActive_ = false;

  return this.isActive_;
};
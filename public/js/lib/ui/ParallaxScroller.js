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

/**
 * @fileoverview
 */


function SlideGroup() {

  this.slides_ = [];

}

SlideGroup.prototype.addSlide = function (slide) {
  return this.slides_.push(slide);
};

SlideGroup.prototype.removeSlide = function (slide) {
  var index = this.slides_.indexOf(slide);
  var removed;

  if (index !== -1) {
    removed = this.slides_.splice(index, 1);
  } else {
    console.warn('the slide requested for removal does not exist in this slide group');
  }

  return (removed.length > 0);
};

module.exports = SlideGroup;

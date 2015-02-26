describe('The Slide', function () {
  var SlideGroup = require('../../../../src/js/lib/preso/SlideGroup');
  var slide;

  beforeEach(function() {
    slide = new SlideGroup();
  });

  describe('manage internal state', function() {
    it('true to be true', function() {
      expect(true).toBe(true);
    });
  });
});
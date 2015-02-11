describe('The Slide', function () {
  var slide;

  beforeEach(function() {
    slide = new Slide();
  });

  describe('manage internal state', function() {
    it('should set and manage its display state', function() {
      expect(slide.isActive_).toEqual(false);
    });

    it('should change the state to true when calling the activate method', function () {
      slide.activate();
      expect(slide.isActive_).toEqual(true);
    });

    it('should change the state to false when calling the deactivate method', function () {
      slide.activate();
      expect(slide.isActive_).toEqual(true);
      slide.deactivate();
      expect(slide.isActive_).toEqual(false);
    });
  });
});
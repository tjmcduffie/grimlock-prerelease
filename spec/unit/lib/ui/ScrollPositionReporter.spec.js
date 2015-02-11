
xdescribe('Scroll position reporter', function() {

  // inject fixture
  var testDiv = document.createElement('div');
  testDiv.style.height = '4000px';
  window.innerHeight = 100;
  document.body.appendChild(testDiv);

  function fakeScrollTo(toX, toY) {
    var dirX = window.scrollX < toX ? 1 : -1;
    var dirY = window.scrollY < toY ? 1 : -1;
    var distX = (window.scrollX < toX) ? toX - window.scrollX : window.scrollX - toX;
    var distY = (window.scrollY < toY) ? toY - window.scrollY : window.scrollY - toY;
    var limit = distY > distX ? distY : distX;
    var increment = 0;

    while(increment < limit) {
      if (window.scrollX !== toX) {
        window.scrollX += dirX;
      }

      if (window.scrollY !== toY) {
        window.scrollY += dirY;
      }
      // scrollEvent = new Event('scroll');
      scrollEvent = document.createEvent('Event');
      scrollEvent.initEvent('scroll');
      document.dispatchEvent(scrollEvent);
      increment++;
    }
  }

  // instantiate the reporter
  new ScrollPositionReporter();

  beforeEach(function() {
    window.scrollX = 0;
    window.scrollY = 0;
    spyOn(ScrollPositionReporter, 'reportPosition_').and.callThrough();
    spyOn(ScrollPositionReporter, 'handleWindowScroll_').and.callThrough();
    spyOn(ScrollPositionReporter, 'updatePosition_').and.callThrough();
  });

  it('should know the user\'s current scroll position', function() {
    expect(ScrollPositionReporter.position_).toEqual({ x: 0, y: 0 });
    expect(ScrollPositionReporter.reportPosition_()).toEqual({ x: 0, y: 0 });
  });

  it('should communicate changes in the user\'s scroll position', function(done) {
    fakeScrollTo(0, 100);
    setTimeout(function() {
      expect(ScrollPositionReporter.handleWindowScroll_).toHaveBeenCalled();
      expect(ScrollPositionReporter.handleWindowScroll_.calls.count()).toBeGreaterThan(1);
      expect(ScrollPositionReporter.position_).toEqual({ x: 0, y: 100 });
      done();
    }, 200);
  });

  xit('should store callbacks to be executed when a scroll position is reached', function() {
  });

  xit('should execute callbacks when a scroll position comes into view', function() {
  });

});
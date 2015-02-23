describe('The Scroll-Element-To object', function () {
  var scrollElementTo = require('../../../../src/js/lib/animation/scrollElementTo');
  var small, tall;

  function DOM() {

    this.sm = document.createElement('div');
    this.sm.style.height = '50px';
    this.sm.style.overflow = 'scroll';
    this.tl = document.createElement('div');
    this.tl.style.height = '1500px';

    this.sm.appendChild(this.tl);
    document.body.appendChild(this.sm);
  }

  beforeEach(function() {
    var elems = new DOM();
    small = elems.sm;
    tall = elems.tl;
  });

  it('scrolls an element to the specified location', function() {
    scrollElementTo(small, 100, 0);
    expect(small.scrollTop).toBe(100);
  });

  it('scrolls an element gradually over time', function(done) {
    scrollElementTo(small, 100, 250);
    setTimeout(function() {
      expect(small.scrollTop).toBe(100);
    }, 251);

    var one = new DOM();
    scrollElementTo(one.sm, 1000, 300);
    setTimeout(function() {
      expect(one.sm.scrollTop).toBe(1000);
    }, 301);

    var two = new DOM();
    scrollElementTo(two.sm, 500, 350);
    setTimeout(function() {
      expect(two.sm.scrollTop).toBe(500);
    }, 351);

    var three = new DOM();
    scrollElementTo(three.sm, 750, 400);
    setTimeout(function() {
      expect(three.sm.scrollTop).toBe(750);
    }, 401);

    var four = new DOM();
    scrollElementTo(four.sm, 10, 450);
    setTimeout(function() {
      expect(four.sm.scrollTop).toBe(10);
      done();
    }, 451);
  });
});
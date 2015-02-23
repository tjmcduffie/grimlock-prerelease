describe('The ease-in-out method assists animations', function () {
  var easeInOut = require('../../../../src/js/lib/animation/easeInOut');


  it('by calculating an appropriate increment based on the quadrilateral function', function() {
    expect(easeInOut(20, 0, 50, 250)).toBe(0.64);
    expect(easeInOut(40, 0, 50, 250)).toBe(2.56);
    expect(easeInOut(60, 0, 50, 250)).toBe(5.76);
    expect(easeInOut(80, 0, 50, 250)).toBe(10.24);
    expect(easeInOut(100, 0, 50, 250)).toBe(16);
    expect(easeInOut(120, 0, 50, 250)).toBe(23.04);
    expect(easeInOut(140, 0, 50, 250)).toBe(30.640000000000008);
  });
});
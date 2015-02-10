'use strict';

var Animation = {};

Animation.scrollToElement = function(element, to, duration) {
    var start = element.scrollTop;
    var change = to - start;
    var currentTime = 0;
    var increment = 20;

    var animate = function(){
        currentTime += increment;
        element.scrollTop = Animation.easeInOutQuad(currentTime, start, change, duration);

        if(currentTime < duration) {
            setTimeout(animate, increment);
        }
    };

    animate();
};

Animation.easeInOutQuad = function (time, start, change, duration) {
    time /= duration / 2;
    if (time < 1) {
        return change / 2 * time * time + start;
    }

    time--;
    return -change / 2 * (time * (time - 2) - 1) + start;
};
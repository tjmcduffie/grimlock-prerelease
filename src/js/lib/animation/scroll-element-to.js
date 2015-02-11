'use strict';

var easeInOut = require('./ease-in-out');


module.exports = function scrollElementTo(element, to, duration) {
    var start = element.scrollTop;
    var change = to - start;
    var currentTime = 0;
    var increment = 20;

    var animate = function(){
        currentTime += increment;
        element.scrollTop = easeInOut(currentTime, start, change, duration);

        if(currentTime < duration) {
            setTimeout(animate, increment);
        }
    };

    animate();
};
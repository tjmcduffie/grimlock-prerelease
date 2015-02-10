'use strict';

module.exports = function easeInOutQuad(time, start, change, duration) {
    time /= duration / 2;
    if (time < 1) {
        return change / 2 * time * time + start;
    }

    time--;
    return -change / 2 * (time * (time - 2) - 1) + start;
};

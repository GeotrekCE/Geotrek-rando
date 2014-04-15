RANDO = RANDO || {};
RANDO.Events = {};


// DOM Level 2 Event model
if (document.addEventListener) {
    RANDO.Events.addEvent = function (elem, type, fn) {
        elem.addEventListener(type, fn, false);
        return fn;
    };
    RANDO.Events.removeEvent = function (elem, type, fn) {
        elem.removeEventListener(type, fn, false);
    };
}
// Proprietary legacy IE Model
else if (document.attachEvent) {
    RANDO.Events.addEvent = function (elem, type, fn) {
        var bound = function () {
            return fn.apply(elem, arguments);
        };
        elem.attachEvent("on" + type, bound);
        return bound;
    };
    RANDO.Events.removeEvent = function (elem, type, fn) {
        elem.removeEventListener("on" + type, fn);
    };
}



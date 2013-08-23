(function(win, doc) {

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(elt /*, from*/) {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = from < 0 ? Math.ceil(from)
                            : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++) {
              if (from in this &&
                  this[from] === elt)
                return from;
            }
            return -1;
        };
    }

    if (win.console === undefined) {
        win.console = {};
        win.console.log = function () {};
        win.console.warn = function(msg) {
            win.alert(msg);
        };
        win.console.error = function(msg) {
            win.alert(msg);
        };
        win.console.assert = function(cond, msg) {
            if (!cond) console.error(msg);
        };
    }

})(window, document);

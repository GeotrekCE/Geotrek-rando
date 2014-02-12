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


    if (!Array.prototype.some) {
      Array.prototype.some = function(fun /*, thisArg */) {
        'use strict';

        if (this === void 0 || this === null)
          throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
          throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
          if (i in t && fun.call(thisArg, t[i], i, t))
            return true;
        }

        return false;
      };
    }


    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fun /*, thisArg */) {
          "use strict";

          if (this === void 0 || this === null)
            throw new TypeError();

          var t = Object(this);
          var len = t.length >>> 0;
          if (typeof fun !== "function")
            throw new TypeError();

          var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
          for (var i = 0; i < len; i++) {
            if (i in t)
              fun.call(thisArg, t[i], i, t);
          }
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


    /*
     * LocalStorage
     * https://gist.github.com/Contra/6368485
     */
    var isStorageAvailable = function (storage) {
      if (typeof storage == 'undefined') return false;
      try { // hack for safari incognito
        storage.setItem("storage", "");
        storage.getItem("storage");
        storage.removeItem("storage");
        return true;
      }
      catch (err) {
        return false;
      }
    };

    if (!isStorageAvailable(window.localStorage) || isStorageAvailable(window.sessionStorage)) (function () {

        var Storage = function (type) {
          function createCookie(name, value, days) {
            var date, expires;

            if (days) {
              date = new Date();
              date.setTime(date.getTime()+(days*24*60*60*1000));
              expires = "; expires="+date.toGMTString();
            } else {
              expires = "";
            }
            document.cookie = name+"="+value+expires+"; path=/";
          }

          function readCookie(name) {
            var nameEQ = name + "=",
                ca = document.cookie.split(';'),
                i, c;

            for (i=0; i < ca.length; i++) {
              c = ca[i];
              while (c.charAt(0)==' ') {
                c = c.substring(1,c.length);
              }

              if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length,c.length);
              }
            }
            return null;
          }

          function setData(data) {
            data = JSON.stringify(data);
            if (type == 'session') {
              window.name = data;
            } else {
              createCookie('localStorage', data, 365);
            }
          }

          function clearData() {
            if (type == 'session') {
              window.name = '';
            } else {
              createCookie('localStorage', '', 365);
            }
          }

          function getData() {
            var data = type == 'session' ? window.name : readCookie('localStorage');
            return data ? JSON.parse(data) : {};
          }


          // initialise if there's already data
          var data = getData();

          return {
            length: 0,
            clear: function () {
              data = {};
              this.length = 0;
              clearData();
            },
            getItem: function (key) {
              return data[key] === undefined ? null : data[key];
            },
            key: function (i) {
              // not perfect, but works
              var ctr = 0;
              for (var k in data) {
                if (ctr == i) return k;
                else ctr++;
              }
              return null;
            },
            removeItem: function (key) {
              if (data[key] === undefined) this.length--;
              delete data[key];
              setData(data);
            },
            setItem: function (key, value) {
              if (data[key] === undefined) this.length++;
              data[key] = value+''; // forces the value to a string
              setData(data);
            }
          };
        };

        if (!isStorageAvailable(window.localStorage)) window.localStorage = new Storage('local');
        if (!isStorageAvailable(window.sessionStorage)) window.sessionStorage = new Storage('session');

    })();

})(window, document);

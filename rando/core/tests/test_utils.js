module.exports = (function() {

    function setUp() {
        casper.options.waitTimeout = 1000;
        casper.options.viewportSize = {width: 1280, height: 768};
        casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11');

        casper.options.timeout = 60000;
        casper.options.onTimeout = function() {
            casper.die('Timed out after 60 seconds.', 1);
        };

        casper.on('page.error', function(msg, trace) {
            this.echo("Error: " + msg, "ERROR");
            for(var i=0; i<trace.length; i++) {
                var step = trace[i];
                this.echo('   ' + step.file + ' (line ' + step.line + ')', "ERROR");
            }
        });
    }

    function clearLocalStorage () {
        // Clear localstorage for next sessions
        casper.evaluate(function () {
            localStorage.clear();
        });
    }

    function done(test) {
        // For next sessions
        casper.then(clearLocalStorage);

        casper.run(function () {
            test.done();
        });
    }

    return {
        clearLocalStorage: clearLocalStorage,
        setUp: setUp,
        done: done,
    };
})();
var ScreenshotReporter = require('./src/tests/lib/screenshot-reporter.js');

exports.config = {
    multiCapabilities: [
        {
            browserName: 'firefox',
        }
    ],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        isVerbose: true
    },

    onPrepare: function() {
        browser.driver.manage().window().setSize(1280, 1024);
        jasmine.getEnv().addReporter(new ScreenshotReporter("/tmp/protractorss"));
    }
};

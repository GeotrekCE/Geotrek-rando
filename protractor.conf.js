var ScreenshotReporter = require('./src/tests/lib/screenshot-reporter.js');

exports.config = {
    framework: 'jasmine2',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    },

    multiCapabilities: [
        {
            browserName: 'firefox',
        }
    ],

    onPrepare: function() {
        browser.driver.manage().window().setSize(1280, 1024);
        jasmine.getEnv().addReporter(new ScreenshotReporter("/tmp/protractorss"));
    }
};

var browserConfs = {
    chrome: {
        browserName: 'chrome',
        count: 1,
        chromeOptions: {
            args: [
                '--test-type'
            ]
        }
    },
    firefox: {
        browserName: 'firefox',
        count: 1,
    },
    // phantom: {
        // 'browserName': 'phantomjs',
        // 'phantomjs.binary.path': require('phantomjs').path,
        // 'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
    // }
}


exports.config = {
    multiCapabilities: [
        browserConfs.chrome,
        // browserConfs.firefox,
        // browserConfs.phantom
    ],
    baseUrl: 'http://geotrek.local'
};

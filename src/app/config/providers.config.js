'use strict';

function providersConfig($sceDelegateProvider, globalSettings) {

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        globalSettings.API_URL + '/**'
    ]);

    // resrources blacklisted for our app
    $sceDelegateProvider.resourceUrlBlacklist([

    ]);
}

module.exports = {
    providersConfig: providersConfig
};
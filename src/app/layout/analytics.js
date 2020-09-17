'use strict';

function AnalyticsConfig(AnalyticsProvider, globalSettings) {

    if (globalSettings.GOOGLE_ANALYTICS_ID) {
        AnalyticsProvider.useAnalytics(true);
        AnalyticsProvider.setAccount({tracker: globalSettings.GOOGLE_ANALYTICS_ID, set: {anonymizeIp: true}});

        // track all routes (or not)
        AnalyticsProvider.trackPages(true);
        AnalyticsProvider.setPageEvent('$stateChangeSuccess');
    } else {
        AnalyticsProvider.useAnalytics(false);
    }

}

module.exports = {
    AnalyticsConfig: AnalyticsConfig
};

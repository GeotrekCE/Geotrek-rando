'use strict'

function AnalyticsConfig(AnalyticsProvider, globalSettings) {

    if (globalSettings.GOOGLE_ANALYTICS_ID) {
        AnalyticsProvider.useAnalytics(true);
        AnalyticsProvider.setAccount(globalSettings.GOOGLE_ANALYTICS_ID);

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
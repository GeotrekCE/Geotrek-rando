var _ = require('lodash');

var globalSettings = _.assign(require('./settings.default.json'), require('../../../custom/settings.custom.json'));

// Enforce 'ENABLE_UNIQUE_CAT' to true as the new user-interface cannot have several active categories at the same time.
globalSettings.ENABLE_UNIQUE_CAT = true;

/**
 *  Because the new user-interface cannot have several active categories at the same time, we
 *  removed the 'DEFAULT_ACTIVE_CATEGORIES' setting. Technically however, the system keeps
 *  working the same way and does expect an array of active categories.
 *  Hence, set the legacy setting to a single value array stating what category should be
 *  active by default.
 */
globalSettings.DEFAULT_ACTIVE_CATEGORIES = [globalSettings.DEFAULT_ACTIVE_CATEGORY];

module.exports = globalSettings;
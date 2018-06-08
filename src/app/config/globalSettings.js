var _ = require('lodash');

var globalSettings = _.assign(require('./settings.default.json'), require('../../../custom/settings.custom.json'));

// Enforce 'ENABLE_UNIQUE_CAT' to true as the new user-interface cannot have several active categories at the same time.
globalSettings.ENABLE_UNIQUE_CAT = true;

module.exports = globalSettings;

var _ = require('lodash');

var globalSettings = _.assign(require('./settings.default.json'), require('../../../custom/settings.custom.json'));

// Technical option enforcing a category to be selected at all times (i.e. the filtering is applied on at
// least one category).
globalSettings.FILTER_ON_AT_LEAST_ONE_CAT = true;

/**
 * The new user-interface cannot have several active categories at the same time.
 * This induces somes changes in the way filter are handled:
 * - We removed the `DEFAULT_ACTIVE_CATEGORIES` setting. Technically however, the system keeps
 *   keeps working the same way and does expect an array of active categories.
 *   Hence, set the legacy setting to a single value array stating what category should be
 *   active by default.
 * - Because we should never have more than one active category, force the
 *   `ENABLE_UNIQUE_CAT` option to true.
 * TODO: We may consider refactoring code/files related to this change if it proves to
 * be a good solution on the long term.
 */
globalSettings.DEFAULT_ACTIVE_CATEGORIES = [globalSettings.DEFAULT_ACTIVE_CATEGORY];
globalSettings.ENABLE_UNIQUE_CAT = true;

/**
 * The new user interface aims at being simpler and more intuitive, making most
 * filters more accessible. This filter drawer is not useful anymore.
 * TODO: We may consider removing all code/files related to this feature if it proves to
 * be definitely useless in the future.
 */
globalSettings.SHOW_FILTERS_ON_MAP = false;

module.exports = globalSettings;

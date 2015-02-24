'use strict';

function filtersService(globalSettings, utilsFactory) {

    var self = this;
    this.activeFilters = {};

    this.createTouristicCategoryFilters = function (categories) {

        if (!self.filters) {
            self.initGlobalFilters();
        }

        _.forEach(categories, function (category) {
            var newCategory = {
                label: category.label,
                id: category.id,
                type1: [],
                type2: []
            };

            if (category.type1 && category.type1.length > 0) {
                newCategory.type1 = category.type1;
            }

            if (category.type2 && category.type2.length > 0) {
                newCategory.type2 = category.type2;
            }

            if (category.difficulties) {
                newCategory.difficulty = [];
                if (category.difficulties.length > 0) {
                    newCategory.difficulty = category.difficulties;
                }
                newCategory.duration = globalSettings.FILTERS.DURATION;
                newCategory.ascent = globalSettings.FILTERS.ASCENT;
            }

            self.filters.categories.push(newCategory);
        });

    };

    this.initGlobalFilters = function (results) {

        if (!self.filters) {
            self.filters = {
                categories:     [],
                themes:         [],
                districts:      [],
                areas:          [],
                search:         ''
            };
        }

        if (results !== undefined) {
            _.forEach(results, function (result) {
                if (result.properties.themes && result.properties.themes.length > 0) {
                    _.forEach(result.properties.themes, function (theme) {
                        if (!(utilsFactory.idIsInArray(self.filters.themes, theme)) && theme !== undefined) {
                            self.filters.themes.push(theme);
                        }
                    });
                }

                if (result.properties.districts && result.properties.districts.length > 0) {
                    _.forEach(result.properties.districts, function (district) {
                        if (!(utilsFactory.idIsInArray(self.filters.districts, district)) && district !== undefined) {
                            self.filters.districts.push(district);
                        }
                    });
                }

                if (result.properties.areas && result.properties.areas.length > 0) {
                    _.forEach(result.properties.areas, function (area) {
                        if (!(utilsFactory.idIsInArray(self.filters.areas, area)) && area !== undefined) {
                            self.filters.areas.push(area);
                        }
                    });
                }

            });
        }

        return this.filters;

    };

    this.getFilters = function () {

        if (self.filters) {
            return self.filters;
        }

        self.initGlobalFilters();
    };

    this.testByString = function (element, query) {

        var result = false;
        element = _.values(element);

        _.each(element, function (property) {
            if (!result) {
                if (typeof property === 'string') {
                    var regex = new RegExp(query, 'gi');
                    if (property.match(regex) !== null) {
                        result = true;
                    }
                } else if (typeof property === 'object') {
                    result = self.testByString(property, query);
                }
            }

        });

        return result;
    };

    this.testById = function (element, filter, filterKey) {
        var result = false,
            currentElement;

        if (element === undefined) {
            return false;
        }

        // Try to find the filter element as a direct child of our element, else test element itself
        if (element[filterKey]) {
            currentElement = element[filterKey];
        } else {
            currentElement = element;
        }

        if (parseInt(currentElement.id, 10) === parseInt(filter, 10)) {
            result = true;
        } else {
            // If element is an object or an array, we can browse it to find the filter
            if (typeof currentElement === 'object') {
                _.forEach(currentElement, function (subelement) {
                    if (self.testById(subelement, filter, filterKey)) {
                        result = true;
                    }
                });
            }
        }

        return result;
    };

    this.filtersChanged = function (filters) {
        return !_.isEqual(filters, self.activeFilters);
    };

    this.matchAny = function (element, filters, name, matchBy) {

        var result = false;

        // If matchBy is not defined or equal id, we are looking for the id matching the filter
        if (matchBy === undefined || matchBy === 'id') {

            // $location provide a string if there's only one value, an array if there's more
            if (typeof filters === 'string') {
                result = self.testById(element, filters, name);
            } else {
                _.forEach(filters, function (filter) {
                    // VAL X OR VAL Y
                    // We set true for any value that pass
                    if (self.testById(element, filter, name)) {
                        result = true;
                    }
                });
            }

        }

        // We want to filter element by a value withing an interval
        if (matchBy === 'interval') {
            console.log('match by interval');
        }

        return result;
    };

    this.categoryHasSubfilters = function (elementCategoryId, filters) {
        var catSubFilters = {};

        _.forEach(filters, function (filter, filterName) {
            // subfilters are composed like catId-subFilterName
            if (filterName.indexOf('_') > -1) {
                var categoryId = filterName.split('_')[0],
                    filterKey = filterName.split('_')[1];

                if (parseInt(categoryId, 10) === parseInt(elementCategoryId, 10)) {

                    //Init catSubfilters child if it doesn't exists
                    if (!catSubFilters[filterKey]) {
                        catSubFilters[filterKey] = [];
                    }
                    catSubFilters[filterKey] = filter;
                }
            }
        });

        return catSubFilters;
    };

    this.filterElement = function (element, filters) {

        // Set Up final test vars
        var categoriesFilter = false,
            themesFilter = false,
            searchFilter = false,
            areasFilter = false,
            districtsFilter = false;

        // Define all type of filters that needs an interval check instead of an id one
        var filtersByInterval = [];


        // Update service activeFilters
        self.activeFilters = filters;


        /* Filter by Categories */
        /*                  */
        /*                  */

        // Use default active categories from config if there's no categories filter
        if (filters.categories) {

            // We can look for category subfilters if the element category match
            if (self.matchAny(element.properties.category, filters.categories, 'category')) {

                var subFilters = self.categoryHasSubfilters(element.properties.category.id, filters);
                // if no subfilters found, then whole category filter pass
                if (_.size(subFilters) > 0) {
                    var subfiltersResults = [];
                    _.forEach(subFilters, function (subFilter, subFilterName) {
                        if (filtersByInterval.indexOf(subFilterName) > -1) {
                            subfiltersResults.push(self.matchAny(element.properties, subFilter, subFilterName, 'interval'));
                        } else {
                            subfiltersResults.push(self.matchAny(element.properties, subFilter, subFilterName));
                        }

                    });
                    if (subfiltersResults.indexOf(false) === -1) {
                        categoriesFilter = true;
                    }

                } else {
                    categoriesFilter = true;
                }

            }

        } else {
            categoriesFilter = self.matchAny(element, globalSettings.DEFAULT_ACTIVE_CATEGORIES, 'category');
        }


        /* Filter by Themes */
        /*                  */
        /*                  */

        // If themes filter is not defined the test pass
        if (filters.themes) {
            themesFilter = self.matchAny(element.properties, filters.themes, 'themes');
        } else {
            themesFilter = true;
        }


        /* Filter by Search Query */
        /*                        */
        /*                        */

        // If search is not defined the test pass
        if (filters.search) {
            searchFilter = self.testByString(element.properties, filters.search);
        } else {
            searchFilter = true;
        }


        /* Filter by Areas */
        /*                 */
        /*                 */

        // If areas filter is not defined the test pass
        if (filters.areas) {
            areasFilter = self.matchAny(element.properties, filters.areas, 'areas');
        } else {
            areasFilter = true;
        }


        /* Filter by Districts */
        /*                     */
        /*                     */

        // If district filter is not defined the test pass
        if (filters.districts) {
            districtsFilter = self.matchAny(element.properties, filters.districts, 'districts');
        } else {
            districtsFilter = true;
        }

        // CATEGORY && THEME && QUERY && AREA && DISTRICT
        // Global test that pass if all filters test are true
        return categoriesFilter && themesFilter && searchFilter && areasFilter && districtsFilter;

    };

}

module.exports = {
    filtersService : filtersService
};
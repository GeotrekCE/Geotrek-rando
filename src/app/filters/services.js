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

            if (category.type1 && category.type1.values.length > 0) {
                newCategory.type1 = category.type1;
            }

            if (category.type2 && category.type2.values.length > 0) {
                newCategory.type2 = category.type2;
            }

            if (category.difficulty) {
                newCategory.difficulty = [];
                if (category.difficulty.values.length > 0) {
                    newCategory.difficulty = category.difficulty;
                }
                if (category.routes.values.length > 0) {
                    newCategory.route = category.routes;
                }
                newCategory.duration = category.duration;
                newCategory.ascent = category.ascent;
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
                cities:          [],
                search:         ''
            };
        }

        if (results) {
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

                if (result.properties.cities && result.properties.cities.length > 0) {
                    _.forEach(result.properties.cities, function (city) {
                        if (!(utilsFactory.idIsInArray(self.filters.cities, city)) && city !== undefined) {
                            self.filters.cities.push(city);
                        }
                    });
                }

            });
        }

        return self.filters;

    };

    this.getFilters = function () {
        return self.filters;
    };

    this.getAFilter = function (id, type, subtype, subId) {
        var filter = null;
        if (type === 'search') {
            filter = {
                id: id,
                label: id
            };
        } else {
            var filters = self.getFilters();

            _.forEach(filters[type], function (currentFilter) {
                if (!subtype) {
                    if (parseInt(currentFilter.id, 10) === parseInt(id, 10) || parseInt(currentFilter.code, 10) === parseInt(id, 10)) {
                        filter = currentFilter;
                    }
                } else {

                    if (subId.indexOf('-') > -1 && currentFilter[subtype]) {
                        var min = subId.split('-')[0],
                            max = subId.split('-')[1],
                            minFilter = null,
                            maxFilter = null;

                        _.forEach(currentFilter[subtype].values, function (currentSubFilter) {
                            if (parseInt(currentSubFilter.id, 10) === parseInt(min, 10)) {
                                minFilter = currentSubFilter;
                            }
                            if (parseInt(currentSubFilter.id, 10) === parseInt(max, 10)) {
                                maxFilter = currentSubFilter;
                            }
                        });

                        if (minFilter && maxFilter) {
                            filter = {id: subId};
                            if (parseInt(minFilter.id, 10) === parseInt(maxFilter.id, 10)) {
                                filter.label = minFilter.label;
                            } else {
                                filter.label = minFilter.label + ' -> ' + maxFilter.label;
                            }
                        }

                    } else {
                        if (parseInt(currentFilter.id, 10) === parseInt(id, 10)) {
                            _.forEach(currentFilter[subtype].values, function (currentSubFilter) {
                                if (parseInt(currentSubFilter.id, 10) === parseInt(subId, 10)) {
                                    filter = currentSubFilter;
                                }
                            });
                        }
                    }
                }
            });
        }

        return filter;
    };

    this.getSelectedFilters = function (activeFilters) {
        var selectedFilters = [];

        _.forEach(activeFilters, function (aFilter, index) {
            var type = index,
                id = 0,
                subtype = null,
                subId = null;

            if (index.indexOf('_') > -1) {
                type = 'categories';
                id = index.split('_')[0];
                subtype = index.split('_')[1];
            }

            if (typeof aFilter === 'string') {
                aFilter = [aFilter];
            }

            _.forEach(aFilter, function (aSubFilter) {

                if (subtype) {
                    subId = aSubFilter;
                } else {
                    id = aSubFilter;
                }

                var tempElement = self.getAFilter(id, type, subtype, subId);
                var tagElement = {
                    id: tempElement.id || tempElement.code,
                    label: tempElement.label || tempElement.name,
                    type: type,
                    typeId: id,
                    subtype: subtype,
                    queryLabel: index
                };
                selectedFilters.push(tagElement);
            });

        });

        return selectedFilters;
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

        if (!element) {
            return false;
        }
        // Try to find the filter element as a direct child of our element, else test element itself
        if (element[filterKey]) {
            currentElement = element[filterKey];
        } else {
            currentElement = element;
        }

        if (parseInt(currentElement.id, 10) === parseInt(filter, 10) || parseInt(currentElement.code, 10) === parseInt(filter, 10)) {
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
            var min = filters.toString().split('-')[0],
                max = filters.toString().split('-')[1],
                elementId = element[name].id || element[name];

            if (parseInt(min, 10) <= parseInt(elementId, 10) && parseInt(elementId, 10) <= parseInt(max, 10)) {
                result = true;
            }
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
            citiesFilter = false,
            districtsFilter = false;

        // Define all type of filters that needs an interval check instead of an id one
        var filtersByInterval = ['difficulty', 'duration', 'ascent'];


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


        /* Filter by cities */
        /*                 */
        /*                 */

        // If cities filter is not defined the test pass
        if (filters.cities) {
            citiesFilter = self.matchAny(element.properties, filters.cities, 'cities');
        } else {
            citiesFilter = true;
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

        // CATEGORY && THEME && QUERY && CITY && DISTRICT
        // Global test that pass if all filters test are true
        return categoriesFilter && themesFilter && searchFilter && citiesFilter && districtsFilter;

    };

}

module.exports = {
    filtersService : filtersService
};
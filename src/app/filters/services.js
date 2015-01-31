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

            if (category.id === 80085) {
                newCategory.difficulty = [];
                if (category.difficulties && category.difficulties.length > 0) {
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

    /*this.testById = function (element, filter, filterKey) {

        var result = false;

        if (element.properties[filterKey]) {

            var prototype = Object.prototype.toString.call(element.properties[filterKey]);

            if (prototype === '[object Array]') {
                _.forEach(element.properties[filterKey], function (element) {
                    _.forEach(filter, function (filterValue) {
                        if (element.id.toString() === filterValue.toString()) {
                            result = true;
                        }
                    });

                });
            } else if (prototype === '[object Object]') {
                if (element.properties[filterKey].id.toString() === filter.toString()) {
                    result = true;
                }
            }

        }

        return result;
    };*/

    this.testById = function (element, filter, filterKey) {
        var result = false,
            currentElement;

        if (element === undefined) {
            return false;
        }

        if (element[filterKey]) {
            currentElement = element[filterKey];
        } else {
            currentElement = element;
        }

        if (parseInt(currentElement.id, 10) === parseInt(filter, 10)) {
            result = true;
        } else {
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

    this.filterElement = function (element, filters) {
        var categoriesResult = false,
            categorySubFilter = false,
            areasResult = false,
            districtsResult = false,
            themesResult = false,
            searchResult = false;

        if (filters.categories) {
            var catIsFiltered = false,
                catSubFilters = {};
            if (typeof filters.categories === 'string') {
                catIsFiltered = self.testById(element.category, filters.categories, 'category');

                if (catIsFiltered) {
                    categoriesResult = true;

                    _.forEach(filters, function (filter, filterName) {
                        if (filterName.indexOf('-') > -1) {
                            var categoryId = filterName.split('-')[0],
                                filterKey = filterName.split('-')[1];
                            if (parseInt(categoryId, 10) === parseInt(element.category.id, 10)) {
                                if (!catSubFilters[filterKey]) {
                                    catSubFilters[filterKey] = [];
                                }
                                catSubFilters[filterKey] = filter;
                            }
                        }
                    });
                    if (Object.keys(catSubFilters).length > 0) {
                        _.forEach(catSubFilters, function (subFilter, subFilterName) {
                            _.forEach(subFilter, function (subFilterValue) {
                                if (parseInt(element.category.id, 10) === parseInt(globalSettings.TREKS_CATEGORY_ID, 10) && subFilterName === 'type2') {
                                    if (self.testById(element.properties, subFilterValue, 'usages')) {
                                        categorySubFilter = true;
                                    }
                                } else {
                                    if (self.testById(element.properties, subFilterValue, subFilterName)) {
                                        categorySubFilter = true;
                                    }
                                }
                            });
                        });
                    } else {
                        categorySubFilter = true;
                    }
                }
            } else {
                _.forEach(filters.categories, function (filter) {
                    catIsFiltered = self.testById(element, filter, 'category');

                    if (catIsFiltered) {
                        categoriesResult = true;
                        _.forEach(filters, function (filter, filterName) {
                            if (filterName.indexOf('-') > -1) {
                                var categoryId = filterName.split('-')[0],
                                    filterKey = filterName.split('-')[1];
                                if (parseInt(categoryId, 10) === parseInt(element.category.id, 10)) {
                                    if (!catSubFilters[filterKey]) {
                                        catSubFilters[filterKey] = [];
                                    }
                                    catSubFilters[filterKey] = filter;
                                }
                            }
                        });

                        if (Object.keys(catSubFilters).length > 0) {
                            _.forEach(catSubFilters, function (subFilter, subFilterName) {
                                _.forEach(subFilter, function (subFilterValue) {
                                    if (parseInt(element.category.id, 10) === parseInt(globalSettings.TREKS_CATEGORY_ID, 10) && subFilterName === 'type2') {
                                        if (self.testById(element.properties, subFilterValue, 'usages')) {
                                            categorySubFilter = true;
                                        }
                                    } else {
                                        if (self.testById(element.properties, subFilterValue, subFilterName)) {
                                            categorySubFilter = true;
                                        }
                                    }
                                });
                            });
                        } else {
                            categorySubFilter = true;
                        }

                    }
                });
            }
        } else {
            if (typeof globalSettings.DEFAULT_ACTIVE_CATEGORIES === 'string') {
                if (parseInt(element.category.id, 10) === parseInt(globalSettings.DEFAULT_ACTIVE_CATEGORIES, 10)) {
                    categoriesResult = true;
                }
            } else {
                _.forEach(globalSettings.DEFAULT_ACTIVE_CATEGORIES, function (filter) {
                    if (parseInt(element.category.id, 10) === parseInt(filter, 10)) {
                        categoriesResult = true;
                    }
                });
            }
        }

        self.activeFilters = filters;

        if (filters.search) {
            searchResult = self.testByString(element.properties, filters.search);
        } else {
            searchResult = true;
        }

        if (filters.areas) {
            _.forEach(element.properties.areas, function (area) {
                _.forEach(filters.areas, function (filter) {
                    if (area.id.toString() === filter.toString()) { areasResult = true; }
                });
            });
        } else {
            areasResult = true;
        }

        if (filters.districts) {
            _.forEach(element.properties.districts, function (district) {
                _.forEach(filters.districts, function (filter) {
                    if (district.id.toString() === filter.toString()) { districtsResult = true; }
                });
            });
        } else {
            districtsResult = true;
        }

        if (filters.themes) {
            if (typeof filters.themes === 'string') {
                themesResult = self.testById(element.properties, filters.themes, 'themes');
            } else {
                _.forEach(filters.themes, function (theme) {
                    if (self.testById(element.properties, theme, 'themes')) {
                        themesResult = true;
                    }
                });
            }
        } else {
            themesResult = true;
        }

        return categoriesResult && categorySubFilter && searchResult && areasResult && districtsResult && themesResult;

    };

    /*this.filterResults = function (results) {
        var filteredResults;

        filteredResults = _.filter(results, function (result) {
            _.forEach(this.filters, function (filter) {
                if (true) {

                }
            });
        });

        return filteredResults;
    };*/

}

module.exports = {
    filtersService : filtersService
};
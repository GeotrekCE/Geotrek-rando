'use strict';

function filtersToolsService () {

    function _localeCompare (a, b) {
        return a.localeCompare ? a.localeCompare(b) : 0;
    }

    function _sorter (input) {
        if (typeof input !== 'object') {
            return input;
        } else if (input instanceof Array) {
            return input.sort();
        } else if (input) {
            var keys   = Object.keys(input).sort(_localeCompare);
            var output = {};
            keys.forEach(function (key) {
                output[key] = _sorter(input[key]);
            });
            input = output;
            return output;
        } else {
            return input;
        }
    }

    function clean (object) {
        delete object.footprint;

        _.forEach(object, function (value, key) {
            if ((value instanceof Array) && (value.length === 0)) {
                delete object[key];
            } else if (value === null) {
                delete object[key];
            }
        });

        object = _sorter(object);

        object.footprint = JSON.stringify(object);

        return object;
    }

    this.clean = clean;
}

function filtersService($rootScope, $q, $location, globalSettings, utilsFactory, resultsService, categoriesService, filtersToolsService, translationService) {

    var self = this,
        activeFiltersModel = {
            categories:     [],
            themes:         [],
            districts:      [],
            cities:         [],
            structure:      [],
            search:         null
        };

    // Define all type of filters that needs an interval check instead of an id one
    var filtersByInterval = ['difficulty', 'duration', 'ascent', 'eLength'];

    self.initFilters = function () {
        var deferred = $q.defer(),
            promises = [];

        if (!self.filters) {
            self.filters = angular.copy(activeFiltersModel);
        }

        // filtersToolsService.clean(self.filters);

        promises.push(
            categoriesService.getNonExcludedCategories()
                .then(
                    function (categories) {
                        self.InitCategoriesFilters(categories);
                    },
                    function (err) {
                        if (console) {
                            console.error(err);
                        }
                    }
                )
        );

        promises.push(
            resultsService.getAllResults()
                .then(
                    function (results) {
                        self.initGlobalFilters(results);
                    },
                    function (err) {
                        if (console) {
                            console.error(err);
                        }
                    }
                )
        );

        $q.all(promises)
            .then(
                function () {
                    self.initActiveFilter();
                    deferred.resolve(self.filters);
                },
                function (err) {
                    if (console) {
                        console.error(err);
                    }
                }
            );

        return deferred.promise;
    };

    self.InitCategoriesFilters = function InitCategoriesFilters (categories) {

        simpleEach(categories, function (category) {
            if (globalSettings.LIST_EXCLUDE_CATEGORIES.indexOf(category.id.toString()) === -1) {
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

                if (category.type === 'treks') {
                    newCategory.difficulty = [];
                    if (category.difficulty.values.length > 0) {
                        newCategory.difficulty = category.difficulty;
                    }
                    if (category.route.values.length > 0) {
                        newCategory.route = category.route;
                    }
                    newCategory.duration = category.duration;
                    newCategory.ascent = category.ascent;
                    newCategory.eLength = category.eLength;
                }

                if (category.begin_date) {
                    newCategory.begin_date = null;
                }

                if (category.end_date) {
                    newCategory.end_date = null;
                }

                if (!self.filters.categories) self.filters.categories = [];
                self.filters.categories.push(newCategory);

                var defaultActiveCategories = globalSettings.DEFAULT_ACTIVE_CATEGORIES;
                if (typeof defaultActiveCategories !== 'object') {
                    defaultActiveCategories = [defaultActiveCategories];
                }

                if (defaultActiveCategories.indexOf(category.id.toString()) > -1 && activeFiltersModel.categories.indexOf(category.id.toString()) === -1) {
                    activeFiltersModel.categories.push(category.id);
                }
            }
        });

    };

    self.initGlobalFilters = function initGlobalFilters (results) {

        if (results) {
            simpleEach(results, function (result) {
                self.addPropertyToFilters(result.properties.themes, 'themes');
                self.addPropertyToFilters(result.properties.districts, 'districts');
                self.addPropertyToFilters(result.properties.cities, 'cities');
                self.addPropertyToFilters(result.properties.structure, 'structure');

            });
        }

        // filtersToolsService.clean(self.filters);

        return self.filters;

    };

    self.addPropertyToFilters = function addPropertyToFilters (property, propertyName) {
        if (property) {
            if (!(property instanceof Array)) {
                property = [property];
            }

            if (property.length > 0) {
                simpleEach(property, function (value) {
                    if (!(utilsFactory.idIsInArray(self.filters[propertyName], value)) && value !== undefined) {
                        if (!self.filters[propertyName]) self.filters[propertyName] = [];
                        return self.filters[propertyName].push(value);
                    }
                });
            }
        }

        return false;
    };

    self.getFilters = function getFilters () {
        return self.filters;
    };




    // Active FIlters
    //

    self.initActiveFilter = function initActiveFilter (forceRefresh) {

        if (!self.activeFilters || forceRefresh) {
            self.activeFilters = angular.copy(activeFiltersModel);
            if (angular.equals($location.search(), {})) {
                $location.search(self.activeFilters);
            } else {
                self.updateActiveFiltersFromUrl();
            }
        }

        filtersToolsService.clean(self.activeFilters);
    };

    self.resetActiveFilters = function () {
        $location.search({});
        self.initActiveFilter(true);
    };

    self.filtersChanged = function filtersChanged (filters) {
        filtersToolsService.clean(self.activeFilters);
        filtersToolsService.clean(filters);

        return !angular.equals(filters, self.activeFilters);
    };

    self.updateActiveFilters = function updateActiveFilters (activeFilters) {
        if (activeFilters.search === '') {
            delete activeFilters.search;
        }
        self.activeFilters = filtersToolsService.clean(activeFilters);

        $location.search(activeFilters);
    };

    self.updateActiveFiltersFromUrl = function updateActiveFiltersFromUrl () {
        var urlFilters = $location.search();

        angular.forEach(urlFilters, function (filterValues, filterName) {
            self.addFilterValueToActiveFilters(filterValues, filterName);
        });

        filtersToolsService.clean(self.activeFilters);

        return self.activeFilters;
    };

    self.addFilterValueToActiveFilters = function addFilterValueToActiveFilters (filterValues, filterName) {
        if (!self.activeFilters[filterName] || filterName === 'categories') {
            self.activeFilters[filterName] = [];
        }


        if (filterName === 'search' || filterName.match(/^\S*(begin_date|end_date)$/i)) {
            self.activeFilters[filterName] = filterValues;
        } else {
            if (typeof filterValues === 'string') {
                filterValues = [filterValues];
            }

            simpleEach(filterValues, function (filterId) {
                if (self.activeFilters[filterName].indexOf(filterId) === -1) {
                    self.activeFilters[filterName].push(filterId);
                }
            });
        }

        filtersToolsService.clean(self.activeFilters);
    };

    self.getActiveFilters = function getActiveFilters () {
        return filtersToolsService.clean(self.activeFilters);
    };






    // Tag Filters
    //

    self.getTagFilters = function getTagFilters () {
        var tagFilters = [],
            finalArray = [];

        angular.forEach(self.activeFilters, function (aFilter, index) {
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
            if (aFilter && aFilter.length) {
                simpleEach(aFilter, function (aSubFilter) {
                    if (subtype) {
                        subId = aSubFilter;
                    } else {
                        id = aSubFilter;
                    }

                    var tempElement = self.getATagFilter(id, type, subtype, subId);
                    if (tempElement) {
                        var tagElement = {
                            uid: (tempElement.id || tempElement.code) + '-' + index,
                            id: tempElement.id || tempElement.code,
                            label: tempElement.label || tempElement.name,
                            type: type,
                            typeId: id,
                            subtype: subtype,
                            queryLabel: index
                        };
                        tagFilters.push(tagElement);
                    }
                });
            }

        });

        if (tagFilters && tagFilters.length) {
            simpleEach(tagFilters, function (filterTag) {
                if (filterTag.subtype) {
                    if (tagFilters && tagFilters.length) {
                        simpleEach(tagFilters, function (tag) {
                            if (tag.typeId === filterTag.typeId && tag.queryLabel === 'categories') {
                                finalArray.push(filterTag);
                            }
                        });
                    }
                } else {
                    finalArray.push(filterTag);
                }
            });
        }

        return finalArray;
    };

    self.getATagFilter = function getATagFilter (id, type, subtype, subId) {
        var filter = null;
        if (type === 'search') {
            filter = {
                id: id,
                label: id
            };
        } else {
            var filters = self.getFilters();

            if (filters[type] && filters[type].length) {
                simpleEach(filters[type], function (currentFilter) {
                    if (!subtype) {
                        if ((currentFilter.id && currentFilter.id.toString() === id.toString()) || (currentFilter.code && currentFilter.code.toString() === id.toString())) {
                            filter = currentFilter;
                        }
                    } else {

                        if (subId.indexOf('-') > -1 && currentFilter[subtype]) {
                            var min = subId.split('-')[0],
                                max = subId.split('-')[1],
                                minFilter = null,
                                maxFilter = null;

                            angular.forEach(currentFilter[subtype].values, function (currentSubFilter) {
                                if (currentSubFilter.id.toString() === min.toString()) {
                                    minFilter = currentSubFilter;
                                }
                                if (currentSubFilter.id.toString() === max.toString()) {
                                    maxFilter = currentSubFilter;
                                }
                            });

                            if (minFilter && maxFilter) {
                                filter = {id: subId};
                                if (minFilter.id.toString() === maxFilter.id.toString()) {
                                    filter.label = minFilter.label;
                                } else {
                                    filter.label = minFilter.label + ' -> ' + maxFilter.label;
                                }
                            }

                        } else {
                            if (currentFilter.id.toString() === id.toString() && currentFilter[subtype]) {
                                if (currentFilter[subtype].values && currentFilter[subtype].values.length) {
                                    simpleEach(currentFilter[subtype].values, function (currentSubFilter) {
                                        if (currentSubFilter.id.toString() === subId.toString()) {
                                            filter = currentSubFilter;
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
            }
        }

        return filter;
    };



    //  Filtering
    //

    var getFilteredResultsPending = {};
    self.getFilteredResults = function getFilteredResults (language) {
        var lang = language || translationService.getCurrentLang();

        if (getFilteredResultsPending[lang]) return getFilteredResultsPending[lang];

        var deferred = $q.defer(),
            filters = self.getActiveFilters();

        resultsService.getAllResults(lang)
            .then(
                function () {
                    simpleEach($rootScope.allResults[lang], function (result) {

                        result.randomize = globalSettings.RANDOMIZE_RESULTS ? (result.randomize || Math.random()) : false;

                        if (!result.prefiltering) { result.prefiltering = {}; }

                        if (result.prefiltering[filters.footprint] === true) {
                            result.isResult = true;
                        } else if (result.prefiltering[filters.footprint] === false) {
                            result.isResult = false;
                        } else if (self.filterElement(result, filters)) {
                            result.isResult = true;
                            result.prefiltering[filters.footprint] = true;
                        } else {
                            result.prefiltering[filters.footprint] = false;
                        }
                    });

                    if (!$rootScope.allResults.matchs) { $rootScope.allResults.matchs = {}; }
                    $rootScope.allResults.matchs[lang] = _.filter($rootScope.allResults[lang], _.matches({ isResult: true })).length;

                    deferred.resolve($rootScope.allResults[lang]);
                    getFilteredResultsPending[lang] = false;
                }
            );

        getFilteredResultsPending[lang] = deferred.promise;
        return deferred.promise;
    };

    self.filterElement = function filterElement (element) {

        if (!self.activeFilters) {
            self.initActiveFilter();
        }

        var filters = self.activeFilters;

        if (!self.matchByCategories(element, filters)) {
            return false;
        }

        if (filters.themes && filters.themes.length && !self.matchById(element.properties, filters.themes, 'themes')) {
            return false;
        }

        if (filters.search && !self.testByString(element.properties, filters.search)) {
            return false;
        }

        if (filters.cities && filters.cities.length && !self.matchById(element.properties, filters.cities, 'cities')) {
            return false;
        }

        if (filters.districts && filters.districts.length && !self.matchById(element.properties, filters.districts, 'districts')) {
            return false;
        }

        if (filters.structure && filters.structure.length && !self.matchById(element.properties, filters.structure, 'structure')) {
            return false;
        }

        // Global test that pass if all filters test are true
        return true;

    };

    self.matchByCategories = function matchByCategories (element, filters) {
        var result = true;

        if (filters.categories && filters.categories.length > 0) {

            if (self.matchById(element.properties.category, filters.categories, 'category')) {

                result = self.matchCategorySubFilters(element, filters);

            } else {
                result = false;
            }

        } else {
            result = false;
        }

        return result;
    };

    self.matchCategorySubFilters = function matchCategorySubFilters (element, filters) {
        var subFilters = self.getCategorySubfilters(element.properties.category.id, filters);

        if (_.size(subFilters) > 0) {
            var subfiltersResults = [];
            angular.forEach(subFilters, function (subFilter, subFilterName) {
                if (filtersByInterval.indexOf(subFilterName) > -1) {
                    subfiltersResults.push(self.matchByRange(element.properties, subFilter, subFilterName));
                } else if (subFilterName === 'begin_date') {
                    subfiltersResults.push(self.matchByDateBegin(element.properties.begin_date, subFilter));
                } else if (subFilterName === 'end_date') {
                    subfiltersResults.push(self.matchByDateEnd(element.properties.end_date, subFilter));
                } else {
                    subfiltersResults.push(self.matchById(element.properties, subFilter, subFilterName));
                }

            });
            if (subfiltersResults.indexOf(false) === -1) {
                return true;
            } else {
                return false;
            }

        } else {
            return true;
        }
    };

    self.getCategorySubfilters = function getCategorySubfilters (elementCategoryId, filters) {
        var catSubFilters = {};
        angular.forEach(filters, function (filter, filterName) {
            // categories subfilters are composed like catId-subFilterName
            if (filterName.indexOf('_') > -1) {
                var categoryId = filterName.split('_')[0],
                    filterKey = filterName.substr(filterName.indexOf('_') + 1);

                if (categoryId.toString() === elementCategoryId.toString() && filter && filter.length > 0) {

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

    self.matchByDateBegin = function matchByDateBegin (elementDate, filterDate) {
        if (Date.parse(elementDate) >= Date.parse(filterDate)) {
            return true;
        }
        return false;
    };

    self.matchByDateEnd = function matchByDateEnd (elementDate, filterDate) {
        if (Date.parse(elementDate) <= Date.parse(filterDate)) {
            return true;
        }
        return false;
    };

    self.matchByRange = function matchByRange (element, filters, name) {
        if (element[name]) {
            var min = filters.toString().split('-')[0],
                max = filters.toString().split('-')[1],
                elementId = element[name].id || element[name];

            if (parseFloat(min, 10) <= parseFloat(elementId, 10) && parseFloat(elementId, 10) <= parseFloat(max, 10)) {
                return true;
            }
        }

        return false;
    };

    self.matchById = function matchById (element, filters, name) {
        // $location provide a string if there's only one value, an array if there's more
        if (typeof filters === 'string') {
            return self.testById(element, filters, name);
        } else {
            var result = false;
            if (filters && filters.length) {
                simpleEach(filters, function (filter) {
                    // VAL X OR VAL Y
                    // We set true for any value that pass
                    if (self.testById(element, filter, name)) {
                        result = true;
                    }
                });
            }
            return result;
        }
    };

    self.testByString = function testByString (element, query) {

        var result  = false;
        var qLength = query.length;
        var regex   = new RegExp(query, 'gi');
        element     = _.values(element);

        simpleEach(element, function (property) {
            if (!result) {
                if (typeof property === 'string' && property.length > qLength) {
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

    self.testById = function testById (element, filter, filterKey) {
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

        if ((currentElement.id && currentElement.id.toString() === filter.toString()) || (currentElement.code && currentElement.code.toString() === filter.toString())) {
            result = true;
        } else {
            // If element is an object or an array, we can browse it to find the filter
            if (typeof currentElement === 'object') {
                angular.forEach(currentElement, function (subelement) {
                    if (self.testById(subelement, filter, filterKey)) {
                        result = true;
                    }
                });
            }
        }

        return result;
    };

}

module.exports = {
    filtersToolsService: filtersToolsService,
    filtersService : filtersService
};

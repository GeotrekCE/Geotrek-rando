'use strict';

function CategoriesListeController($scope, $rootScope, $location, utilsFactory, globalSettings, categoriesService, filtersService) {

    function updateCategories() {
        var currentQuery = filtersService.getActiveFilters(),
            categories = $scope.categories;

        for (var i = categories.length - 1; i >= 0; i--) {
            var category = categories[i];

            category.active = false;
            category.filters = {};
            if (currentQuery.categories) {
                var categoriesArray = currentQuery.categories;

                if (typeof categoriesArray === 'string') {
                    categoriesArray = [categoriesArray];
                }

                for (var j = categoriesArray.length - 1; j >= 0; j--) {
                    if (category.id.toString() === categoriesArray[j].toString()) {
                        category.active = true;
                    }
                }

                _.forEach(currentQuery, function (filter, filterName) {
                    if (filterName.indexOf('_') > -1) {
                        var categoryId = filterName.split('_')[0],
                            filterKey = filterName.split('_')[1];
                        if (categoryId.toString() === category.id.toString()) {
                            if (typeof filter === 'string') {
                                filter = [filter];
                            }

                            for (var k = filter.length - 1; k >= 0; k--) {
                                var filterValue = filter[k];
                                if (!category.filters[filterKey]) {
                                    category.filters[filterKey] = {};
                                }

                                var capture = filterValue.toString().match(/^(\d+)-(\d+)$/i);
                                if (capture) {
                                    var minIndex,
                                        maxIndex;
                                    category.filters[filterKey] = {};
                                    category.filters[filterKey][filterValue] = true;

                                    for (var l = category[filterKey].values.length - 1; l >= 0; l--) {
                                        var currentFilter = category[filterKey].values[l];

                                        if (currentFilter.id.toString() === capture[1].toString()) {
                                            minIndex = l;
                                        }

                                        if (currentFilter.id.toString() === capture[2].toString()) {
                                            maxIndex = l;
                                        }
                                    }

                                    category[filterKey].min = minIndex;
                                    category[filterKey].max = maxIndex;
                                } else {
                                    category.filters[filterKey][filterValue] = true;
                                }
                            }
                        }
                    }
                });

            } else {
                if (typeof globalSettings.DEFAULT_ACTIVE_CATEGORIES === 'string') {
                    globalSettings.DEFAULT_ACTIVE_CATEGORIES = [globalSettings.DEFAULT_ACTIVE_CATEGORIES];
                }

                for (var m = globalSettings.DEFAULT_ACTIVE_CATEGORIES.length - 1; m >= 0; m--) {
                    if (category.id.toString() === globalSettings.DEFAULT_ACTIVE_CATEGORIES[m].toString()) {
                        category.active = true;
                    }
                }

            }
        }

        $scope.categories = categories;
    }

    function resetRangeFilter(filter) {
        filter.min = 0;
        filter.max = filter.values.length - 1;
    }

    function initRangeFilters() {
        var categories = $scope.categories;
        _.forEach(categories, function (category) {
            _.forEach(category, function (property, propertyName) {
                if (property && property.type && property.type === 'range') {

                    if (property.values.length > 1) {
                        resetRangeFilter(property);
                        $scope.$watchGroup(
                            [
                                function () {
                                    return property.min;
                                },
                                function () {
                                    return property.max;
                                }
                            ],
                            function () {
                                var minIndex = property.min,
                                    maxIndex = property.max;
                                category.filters[propertyName] = {};
                                if (minIndex !== 0 || maxIndex !== property.values.length - 1) {
                                    var min = property.values[minIndex].id.toString();
                                    var max = property.values[maxIndex].id.toString();
                                    category.filters[propertyName][min + '-' + max] = true;
                                } else {
                                    category.filters[propertyName]['0-max'] = false;
                                }
                                $scope.propagateFilters();
                            },
                            true
                        );
                        $scope.$on('resetRange', function (event, data) {
                            var eventCategory = data.category,
                                filter = data.filter;
                            var categories = $scope.categories;
                            _.forEach(categories, function (currentCategory) {
                                if (currentCategory.id.toString() === eventCategory.toString()) {
                                    if (filter === 'all') {
                                        _.forEach(currentCategory, function (currentFilter, currentFilterName) {
                                            if (currentFilter.type === 'range') {
                                                resetRangeFilter(currentCategory[currentFilterName]);
                                            }
                                        });
                                    } else if (currentCategory[filter]) {
                                        resetRangeFilter(currentCategory[filter]);
                                    }
                                }

                            });
                            $scope.categories = categories;
                        });
                    }

                }
            });
        });
        $scope.categories = categories;
    }

    function loadCategories(forceRefresh) {
        categoriesService.getCategories(forceRefresh)
            .then(
                function (categories) {
                    $scope.categories = categories;
                    initRangeFilters();
                    updateCategories();
                    $rootScope.$on('updateFilters', updateCategories);
                }
            );
    }

    $scope.toggleCategory = function (category) {
        category.active = !category.active;
        $scope.propagateFilters();
    };

    $scope.propagateFilters = function () {
        var currentQuery = $location.search(),
            categories = $scope.categories,
            activeCategories = [];
        for (var i = categories.length - 1; i >= 0; i--) {
            var category = categories[i];

            if (category.active) {
                activeCategories.push(category.id.toString());
                _.forEach(category.filters, function (filter, filterKey) {
                    var filterIsNotEmpty = false;
                    var currentFilterValues = [];
                    _.forEach(filter, function (value, valueKey) {

                        if (value) {
                            filterIsNotEmpty = true;
                            currentFilterValues.push(valueKey);
                        }
                    });
                    if (filterIsNotEmpty) {
                        currentQuery[category.id.toString() + '_' + filterKey] = currentFilterValues;
                    } else {
                        delete currentQuery[category.id.toString() + '_' + filterKey];
                    }
                });
            } else {
                _.forEach(category.filters, function (filter, filterKey) {
                    if (currentQuery[category.id.toString() + '_' + filterKey]) {
                        delete currentQuery[category.id.toString() + '_' + filterKey];
                    }
                });
            }
        }

        currentQuery.categories = activeCategories;
        filtersService.updateActiveFilters(currentQuery);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.isSVG = utilsFactory.isSVG;

    loadCategories();
    $rootScope.$on('switchGlobalLang', function () {
        loadCategories(true);
    });

    $rootScope.$on('updateCategories', function () {
        updateCategories();
    });
}

module.exports = {
    CategoriesListeController: CategoriesListeController
};
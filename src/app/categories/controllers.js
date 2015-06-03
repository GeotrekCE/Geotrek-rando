'use strict';

function CategoriesListeController($scope, $rootScope, $location, utilsFactory, globalSettings, categoriesService, filtersService) {

    function updateCategories() {
        var currentQuery = $location.search();
        var categories = $scope.categories;
        _.forEach(categories, function (category) {

            category.active  = false;
            category.open    = category.open | false;
            category.filters = {};
            if (currentQuery.categories) {
                var categoriesArray = currentQuery.categories;

                if (typeof categoriesArray === 'string') {
                    categoriesArray = [categoriesArray];
                }

                _.forEach(categoriesArray, function (filter) {
                    if (category.id.toString() === filter.toString()) {
                        category.active = true;
                    }
                });

                _.forEach(currentQuery, function (filter, filterName) {
                    if (filterName.indexOf('_') > -1) {
                        var categoryId = filterName.split('_')[0],
                            filterKey = filterName.split('_')[1];
                        if (categoryId.toString() === category.id.toString()) {
                            if (typeof filter === 'string') {
                                filter = [filter];
                            }

                            _.forEach(filter, function (filterValue) {
                                if (!category.filters[filterKey]) {
                                    category.filters[filterKey] = {};
                                }

                                var capture = filterValue.toString().match(/^(\d+)-(\d+)$/i);
                                if (capture) {
                                    var minIndex,
                                        maxIndex;
                                    category.filters[filterKey] = {};
                                    category.filters[filterKey][filterValue] = true;
                                    _.forEach(category[filterKey].values, function (currentFilter, index) {
                                        if (currentFilter.id.toString() === capture[1].toString()) {
                                            minIndex = index;
                                        }

                                        if (currentFilter.id.toString() === capture[2].toString()) {
                                            maxIndex = index;
                                        }
                                    });
                                    category[filterKey].min = minIndex;
                                    category[filterKey].max = maxIndex;
                                } else {
                                    category.filters[filterKey][filterValue] = true;
                                }
                            });
                        }
                    }
                });

            } else {
                if (typeof globalSettings.DEFAULT_ACTIVE_CATEGORIES === 'string') {
                    globalSettings.DEFAULT_ACTIVE_CATEGORIES = [globalSettings.DEFAULT_ACTIVE_CATEGORIES];
                }

                _.forEach(globalSettings.DEFAULT_ACTIVE_CATEGORIES, function (filter) {
                    if (category.id.toString() === filter.toString()) {
                        category.active = true;
                    }
                });

            }

        });
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
                function (data) {
                    var activeCategories = [];
                    _.each(data, function (cat) {
                        if (globalSettings.LIST_EXCLUDE_CATEGORIES.indexOf(cat.id) === -1) {
                            activeCategories.push(cat);
                        }
                    });
                    $scope.categories = activeCategories;
                    initRangeFilters();
                    updateCategories();
                    $rootScope.$on('updateFilters', updateCategories);
                }
            );
    }

    $scope.toggleCategory = function (category, force) {
        category.active = (typeof force === 'boolean') ? force : !category.active;
        $scope.propagateFilters();
    };

    $scope.filterChange = function (category) {
        $scope.toggleCategory(category, true);
    };

    $scope.propagateFilters = function () {
        var currentQuery = $location.search(),
            activeCategories = [];
        _.forEach($scope.categories, function (category) {
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
        });

        currentQuery.categories = activeCategories;
        $location.search(currentQuery);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.toggleDisplayCategory = function (category, state) {
        category.open = (typeof state === 'boolean') ? state : !category.open;
        $scope.hideSiblings(category);
    };

    $scope.hideSiblings = function (mainCategory) {
        _.forEach($scope.categories, function (category) {
            if (category === mainCategory) return;
            category.open = false;
        });
    }

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
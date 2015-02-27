'use strict';

function CategoriesListeController($scope, $rootScope, $location, globalSettings, categoriesService) {

    function updateCategories() {
        var currentQuery = $location.search();
        _.forEach($scope.categories, function (category) {

            category.active = false;
            category.filters = {};
            if (currentQuery.categories) {
                var categoriesArray = currentQuery.categories;

                if (typeof categoriesArray === 'string') {
                    categoriesArray = [categoriesArray];
                }

                _.forEach(categoriesArray, function (filter) {
                    if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                        category.active = true;
                    }
                });

                _.forEach(currentQuery, function (filter, filterName) {
                    if (filterName.indexOf('_') > -1) {
                        var categoryId = filterName.split('_')[0],
                            filterKey = filterName.split('_')[1];
                        if (parseInt(categoryId, 10) === parseInt(category.id, 10)) {
                            if (typeof filter === 'string') {
                                filter = [filter];
                            }

                            _.forEach(filter, function (filterValue) {
                                if (!category.filters[filterKey]) {
                                    category.filters[filterKey] = {};
                                }

                                var capture = filterValue.toString().match(/^(\d+)-(\d+)$/i);
                                if (capture) {
                                    category.filters[filterKey] = filterValue;
                                    category[filterKey].min = parseInt(capture[1], 10);
                                    category[filterKey].max = parseInt(capture[2], 10);
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
                    if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                        category.active = true;
                    }
                });

            }

        });
    }

    function initRangeFilters() {
        _.forEach($scope.categories, function (category, categoryIndex) {
            if (category.difficulties && category.difficulties.values.length > 1) {
                category.difficulties.min = 0;
                category.difficulties.max = category.difficulties.values.length - 1;
                $scope.$watchGroup(
                    [
                        function (scope) {
                            return scope.categories[categoryIndex].difficulties.min;
                        },
                        function (scope) {
                            return scope.categories[categoryIndex].difficulties.max;
                        }
                    ],
                    function () {
                        if ($scope.categories[categoryIndex].difficulties.min !== 0 || $scope.categories[categoryIndex].difficulties.max !== $scope.categories[categoryIndex].difficulties.values.length - 1) {
                            $scope.categories[categoryIndex].filters.difficulties = {};
                            $scope.categories[categoryIndex].filters.difficulties[$scope.categories[categoryIndex].difficulties.min.toString() + '-' + $scope.categories[categoryIndex].difficulties.max.toString()] = true;
                        } else {
                            delete $scope.categories[categoryIndex].filters.difficulties;
                        }
                        $scope.propagateFilters();
                    },
                    true
                );
            }
        });
    }

    function loadCategories() {
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
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
            activeCategories = [];

        _.forEach($scope.categories, function (category) {
            if (category.active) {
                activeCategories.push(category.id);
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
                        currentQuery[category.id + '_' + filterKey] = currentFilterValues;
                    } else {
                        delete currentQuery[category.id + '_' + filterKey];
                    }
                });
            } else {
                _.forEach(category.filters, function (filter, filterKey) {
                    if (currentQuery[category.id + '_' + filterKey]) {
                        delete currentQuery[category.id + '_' + filterKey];
                    }
                });
            }
        });

        currentQuery.categories =  activeCategories;
        $location.search(currentQuery);
        $rootScope.$broadcast('updateFilters');
    };

    loadCategories();

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};
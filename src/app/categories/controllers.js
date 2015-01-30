'use strict';

function CategoriesListeController($scope, $rootScope, $location, globalSettings, categoriesService) {

    function loadCategories() {
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
                    _.forEach($scope.categories, function (category) {

                        category.active = false;
                        category.filters = {};

                        if ($location.search().categories) {
                            if (typeof $location.search().categories === 'string') {
                                if (parseInt(category.id, 10) === parseInt($location.search().categories, 10)) {
                                    category.active = true;
                                }
                            } else {
                                _.forEach($location.search().categories, function (filter) {
                                    if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                                        category.active = true;
                                    }
                                });
                            }

                            _.forEach($location.search(), function (filter, filterName) {
                                if (filterName.indexOf('-') > -1) {
                                    var categoryId = filterName.split('-')[0],
                                        filterKey = filterName.split('-')[1];
                                    if (parseInt(categoryId, 10) === parseInt(category.id, 10)) {
                                        if (typeof filter === 'string') {
                                            if (!category.filters[filterKey]) {
                                                category.filters[filterKey] = {};
                                            }
                                            category.filters[filterKey][filter] = true;
                                        } else {
                                            _.forEach(filter, function (filterValue) {
                                                if (!category.filters[filterKey]) {
                                                    category.filters[filterKey] = {};
                                                }
                                                category.filters[filterKey][filterValue] = true;
                                            });
                                        }
                                    }
                                }
                            });

                        } else {
                            if (typeof globalSettings.DEFAULT_ACTIVE_CATEGORIES === 'string') {
                                if (parseInt(category.id, 10) === parseInt(globalSettings.DEFAULT_ACTIVE_CATEGORIES, 10)) {
                                    category.active = true;
                                }
                            } else {
                                _.forEach(globalSettings.DEFAULT_ACTIVE_CATEGORIES, function (filter) {
                                    if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                                        category.active = true;
                                    }
                                });
                            }

                        }

                    });
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
                        currentQuery[category.id + '-' + filterKey] = currentFilterValues;
                    } else {
                        delete currentQuery[category.id + '-' + filterKey];
                    }
                });
            } else {
                _.forEach(category.filters, function (filter, filterKey) {
                    if (currentQuery[category.id + '-' + filterKey]) {
                        delete currentQuery[category.id + '-' + filterKey];
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
'use strict';

function CategoriesListeController($scope, $rootScope, $location, globalSettings, categoriesService) {

    function loadCategories() {
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
                    console.log(data);
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
                    console.log($scope.categories);
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
                activeCategories[category.id] = {
                    filters: category.filters
                };
            }
        });

        currentQuery.categories =  activeCategories;
        console.log(currentQuery);
        $location.search(currentQuery);
        $rootScope.$broadcast('updateFilters');
    };

    loadCategories();

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};
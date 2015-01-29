'use strict';

function CategoriesListeController($scope, $rootScope, $location, globalSettings, categoriesService) {

    function loadCategories() {
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
                    _.forEach($scope.categories, function (category) {

                        category.active = false;

                        if ($location.search().categories) {
                            _.forEach($location.search().categories, function (filter) {
                                if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                                    category.active = true;
                                }
                            });
                        } else {
                            _.forEach(globalSettings.DEFAULT_ACTIVE_CATEGORIES, function (filter) {
                                if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                                    category.active = true;
                                }
                            });
                        }

                    });
                    console.log($scope.categories);
                }
            );
    }

    $scope.toggleCategory = function (category) {
        var currentQuery = $location.search(),
            activeCategories = [];

        category.active = !category.active;
        _.forEach($scope.categories, function (category) {
            if (category.active) {
                activeCategories.push(category.id);
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
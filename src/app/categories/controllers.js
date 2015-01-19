'use strict';

function CategoriesListeController($scope, categoriesService) {

    function loadCategories() {
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
                }
            );
    }

    loadCategories();

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};
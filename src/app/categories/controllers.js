'use strict';

function CategoriesListeController($scope, categoriesService) {

    function loadCategories() {
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
                    console.log(data);
                }
            );
    }

    loadCategories();

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};
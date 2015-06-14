'use strict';

function CategoriesListeController($scope, $rootScope, $location, utilsFactory, globalSettings, categoriesService, filtersService) {

    function loadCategories(forceRefresh) {
        categoriesService.getCategories(forceRefresh)
            .then(
                function (categories) {
                    $scope.categories = categories;
                    //initRangeFilters();
                }
            );
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
                                //$scope.propagateActiveFilters();
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

    $scope.toggleCategory = function (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory > -1) {
            categories.splice(indexOfCategory, 1);
        } else {
            categories.push(category.id.toString());
        }
        $scope.propagateActiveFilters();
    };

    $scope.toogleCategoryFilter = function (categoryId, filterType, filterId) {
        var categoryFilter = $rootScope.activeFilters[categoryId + '_' + filterType];

        if (categoryFilter) {
            var indexOfFilter = categoryFilter.indexOf(filterId.toString());
            if (indexOfFilter > -1) {
                categoryFilter.splice(indexOfFilter, 1);
            } else {
                $rootScope.activeFilters[categoryId + '_' + filterType].push(filterId.toString());    
            }
        } else {
            $rootScope.activeFilters[categoryId + '_' + filterType] = [filterId.toString()];
        }
        $scope.propagateActiveFilters();
    };

    $scope.propagateActiveFilters = function () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.isSVG = utilsFactory.isSVG;

    loadCategories();
    $rootScope.$on('switchGlobalLang', function () {
        loadCategories(true);
    });

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};
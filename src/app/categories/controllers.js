'use strict';

function CategoriesListeController($scope, $rootScope, $location, $timeout, utilsFactory, globalSettings, categoriesService, filtersService) {
    $scope.extend = false;
    $scope.filtering = false;

    $scope.difficultyIsCollapsed = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.durationIsCollapsed   = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.ascentIsCollapsed     = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.lengthIsCollapsed     = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.startDateIsCollapsed  = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.endDateIsCollapsed    = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.type1IsCollapsed      = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.type2IsCollapsed      = globalSettings.FILTERS_DEFAULT_OPEN;
    $scope.routeIsCollapsed      = globalSettings.FILTERS_DEFAULT_OPEN;

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters();
    }

    function loadCategories(forceRefresh) {
        categoriesService.getNonExcludedCategories(forceRefresh)
            .then(
                function (categories) {
                    $scope.categories = categories;
                }
            );
    }

    function resetRangeFilter(filter) {
        filter.min = 0;
        filter.max = filter.values.length - 1;
    }

    function initRangeValues(categoryId, filter, filterName) {
        var uid = categoryId + '_' + filterName;
        var activeFilters = filtersService.getActiveFilters();
        var valuesLength = filter.values.length;

        $scope.activeRangeValues[uid] = {
            floor: 0,
            ceil: valuesLength - 1,
            values: filter.values
        };
        if (activeFilters && activeFilters[uid]) {
            var minValue = activeFilters[uid][0].split('-')[0],
                maxValue = activeFilters[uid][0].split('-')[1],
                minIndex = 0,
                maxIndex = valuesLength - 1;

            simpleEach(filter.values, function (value, valueIndex) {
                if (value.id.toString() === minValue.toString()) {
                    minIndex = valueIndex;
                }

                if (value.id.toString() === maxValue.toString()) {
                    maxIndex = valueIndex;
                }
            });

            $scope.activeRangeValues[uid].min = minIndex;
            $scope.activeRangeValues[uid].max = maxIndex;
        } else {
            $scope.activeRangeValues[uid].min = 0;
            $scope.activeRangeValues[uid].max = valuesLength - 1;
        }
    }

    function initRangeFilters() {
        var categories = $scope.categories;

        $scope.activeRangeValues = {};

        for (var i = categories.length - 1; i >= 0; i--) {
            var category = categories[i];

            angular.forEach(category, function (property, propertyName) {
                if (property && property.type && property.type === 'range') {

                    initRangeValues(category.id, property, propertyName);

                }
            });
        }

        $scope.$watch('activeRangeValues', function () {
            if ($scope.rangeUpdate) {
                $timeout.cancel($scope.rangeUpdate);
            }
            $scope.rangeUpdate = $timeout(function () {
                $scope.updateActiveRangeFilters();
            }, 300);
        }, true);

        $scope.$on('resetRange', function (event, data) {
            var filter = data.filter;
            var rangeFilters = $scope.activeRangeValues;
            _.forEach(rangeFilters, function (rangeFilter, rangeFilterName) {

                if (filter === 'all' || rangeFilterName.toString() === filter.toString()) {
                    resetRangeFilter(rangeFilter);
                }

            });
            $scope.activeRangeValues = rangeFilters;
        });
    }

    function initDateValues() {
        var categories = $scope.categories;

        for (var i = categories.length - 1; i >= 0; i--) {
            var category = categories[i];

            angular.forEach(category, function (property, propertyName) {

                var filterName = category.id + '_' + propertyName,
                    activeFilter = $scope.activeFilters[filterName],
                    startDate = null,
                    endDate = null;


                if (activeFilter && (propertyName === 'begin_date')) {
                    startDate = new Date(activeFilter);
                }

                if (activeFilter && (propertyName === 'end_date')) {
                    endDate = new Date(activeFilter);
                }

                $scope.activeDateFilters[category.id] = {
                    "startDate": startDate,
                    "endDate": endDate
                };

            });
        }
    }

    function initDatePickers() {
        $scope.activeDateFilters = {};

        initDateValues();

        $scope.$watch('activeDateFilters', function () {
            $scope.updateActiveDateFilters();
        }, true);
    }

    $scope.clearDateFilter = function clearDateFilter (dateFilterName) {
        $scope.activeDateFilters[dateFilterName] = {
            "startDate": null,
            "endDate": null
        };

        $scope.updateActiveDateFilters();
    };

    $scope.updateActiveDateFilters = function updateActiveDateFilters () {
        angular.forEach($scope.activeDateFilters, function (filterValues, filterName) {
            if (filterValues.startDate) {
                $rootScope.activeFilters[filterName + '_begin_date'] = filterValues.startDate.toISOString();
            } else {
                $rootScope.activeFilters[filterName + '_begin_date'] = null;
            }
            if (filterValues.endDate) {
                $rootScope.activeFilters[filterName + '_end_date'] = filterValues.endDate.toISOString();
            } else {
                $rootScope.activeFilters[filterName + '_end_date'] = null;
            }
        });

        $scope.propagateActiveFilters();
    };

    $scope.updateActiveRangeFilters = function updateActiveRangeFilters () {
        angular.forEach($scope.activeRangeValues, function (filterValues, filterName) {
            if (!filterValues.values) {
                return false;
            }
            var minIndex = filterValues.min,
                maxIndex = filterValues.max;
            if (minIndex !== 0 || maxIndex !== filterValues.values.length - 1) {
                var min = filterValues.values[minIndex].id.toString();
                var max = filterValues.values[maxIndex].id.toString();
                $rootScope.activeFilters[filterName] = [min + '-' + max];
            } else {
                $rootScope.activeFilters[filterName] = null;
            }
        });

        $scope.propagateActiveFilters();
    };

    $scope.activateCategory = function activateCategory (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory < 0) {
            if (globalSettings.ENABLE_UNIQUE_CAT) {
                $rootScope.activeFilters.categories = [];
            }
            $rootScope.activeFilters.categories.push(category.id.toString());
        }
        $scope.propagateActiveFilters();
    };

    $scope.deactivateCategory = function deactivateCategory (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory > -1) {
            categories.splice(indexOfCategory, 1);
        }
        $scope.propagateActiveFilters();
    };

    $scope.toggleAllCategories = function toggleAllCategories () {
        var categories = $scope.categories;
        if ($rootScope.activeFilters.categories.length > 0) {
            $rootScope.activeFilters.categories = [];
        } else {
            $rootScope.activeFilters.categories = [];
            categories.forEach(function (category) {
                $rootScope.activeFilters.categories.push(category.id.toString());
            });
        }
        $scope.propagateActiveFilters();
    };

    $scope.toggleCategory = function toggleCategory (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory > -1) {
            categories.splice(indexOfCategory, 1);
        } else {
            if (globalSettings.ENABLE_UNIQUE_CAT) {
                $rootScope.activeFilters.categories = [];
            }
            $rootScope.activeFilters.categories.push(category.id.toString());
        }
        $scope.propagateActiveFilters();
    };

    $scope.toogleCategoryFilter = function toogleCategoryFilter (categoryId, filterType, filterId) {
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

    $scope.closeCategoryFilters = function closeCategoryFilters (category) {
        $scope.filtering = false;
        if (category) {
            category.open = false;
        } else {
            _.forEach($scope.categories, function (category) {
                category.open = false;
            });
        }
    };

    var hideSiblings = function hideSiblings (mainCategory) {
        _.forEach($scope.categories, function (category) {
            if (category.id !== mainCategory.id) {
                category.open = false;
            }
        });
    };

    $scope.openCategoryFilters = function openCategoryFilters (category) {
        category.open    = true;
        $scope.filtering = true;
        hideSiblings(category);
    };

    $scope.propagateActiveFilters = function propagateActiveFilters () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateFilters', true);
    };

    $scope.toggleCategories = function toggleCategories () {
        $scope.extend = !$scope.extend;
        if (!$scope.extend) {
            $scope.closeCategoryFilters();
        }
    };

    $scope.extendCategories = function extendCategories () {
        if ($scope.extend && $scope.filtering) {
            $scope.openCategoryFilters(this.category);
        }
        $scope.extend = true;
    };

    $scope.foldCategories = function foldCategories () {
        $scope.extend = false;
        $scope.closeCategoryFilters();
    };

    function initFilters() {
        initDatePickers();
        initRangeFilters();

        $scope.categories.forEach(function (category) {
            category.hasFilters = (category.ascent && category.ascent.values.length > 1) || (category.begin_date !== undefined) || (category.difficulty && category.difficulty.values.length > 1) || (category.duration && category.duration.values.length > 1) || (category.eLength && category.eLength.values.length > 1) || (category.end_date !== undefined) || (category.route && category.route.values.length > 0) || (category.type1 && category.type1.values.length > 0) || (category.type2 && category.type2.values.length > 0);
        });
    }

    loadCategories();

    var rootScopeEvents = [
        $rootScope.$on('updateFilters', function(name, forceRefresh) {
            if (!forceRefresh) {
                initFilters();
            }
        }),
        $rootScope.$on('switchGlobalLang', function () {
            loadCategories(true);
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

    // popup opening
    $scope.open = function open () {
        $timeout(function () {
            $scope.opened = true;
        });
    };
}

module.exports = {
    CategoriesListeController: CategoriesListeController
};

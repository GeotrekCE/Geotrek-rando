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

    /**
     * Loads the list of categories for current context (API and current language).
     *
     * @param {Boolean} forceRefresh
     *   Whether the list of categories should be refreshed.
     * @param {Callable} callback
     *   Function to be called when loading categories finished.
     *   Optional. Gets called with no parameter.
     */
    function loadCategories(forceRefresh, callback) {
        categoriesService.getNonExcludedCategories(forceRefresh)
            .then(
                function (categories) {
                    $scope.categories = categories;

                    if (typeof callback === 'function') {
                        callback();
                    }
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

        // Compute labels for RZ Slider.
        var rzStepLabels = [];
        if (filter.values instanceof Array) {
            for (var i = 0; i < filter.values.length; i++) {
                var currentValue = filter.values[i];

                rzStepLabels.push({
                    value: i,
                    legend: currentValue.label,
                });
            }
        }

        $scope.activeRangeValues[uid] = {
            values: filter.values,
            options: {
                floor: 0,
                ceil: valuesLength - 1,
                showTicks: true,
                step: 1,
                // Translate is used to display a custom value above cursors.
                // As we do not want values to be displayed, simply return an empty string.
                translate: function(value) {
                    return rzStepLabels[value].legend;
                }
            }
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
            $timeout(function () {
                $scope.$broadcast('reCalcViewDimensions');
            });
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

    }

    $scope.changeDates = function () {
        $scope.updateActiveDateFilters();
    };

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

    $scope.toggleCategory = function toggleCategory (category) {
        var categories = $rootScope.activeFilters.categories;
        var indexOfCategory = -1;

        if (categories instanceof Array) {
            indexOfCategory = categories.indexOf(category.id.toString());
        } else {
            $rootScope.activeFilters.categories = [];
            categories = $rootScope.activeFilters.categories;
        }

        if (indexOfCategory > -1) {
            categories.splice(indexOfCategory, 1);
        } else {
            if (globalSettings.ENABLE_UNIQUE_CAT) {
                $rootScope.activeFilters.categories = [];
            }
            $rootScope.activeFilters.categories.push(category.id.toString());
        }

        // If the 'filter on at least one category' option is active, ensure that
        // we always keep one category active.
        if (globalSettings.FILTER_ON_AT_LEAST_ONE_CAT && categories.length == 0) {
            categories.push(category.id.toString());
        }

        // Toogle the filter toolbar for this category.
        $scope.toggleCategoryFilters(category);

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

    $scope.toggleCategoryFilters = function toggleCategoryFilters (category) {
        if (category.open) {
            $scope.closeCategoryFilters(category);
        }
        else {
            $scope.openCategoryFilters(category);
        }
    }

    $scope.propagateActiveFilters = function propagateActiveFilters () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateResultsList', true);
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

    /**
     * Detects if at least one category filter bar is currently deployed.
     */
    $scope.isACategoryFilterBarOpen = function isACategoryFilterBarOpen () {
        // if the list of categories does not exist yet, abort.
        if (!($scope.categories instanceof Array)) {
            return false;
        }

        for (var i = 0; i < $scope.categories.length; i++) {
            var currentCategory = $scope.categories[i];

            // If a category is expanded, stop here and return true.
            if (currentCategory.open) {
                return true;
            }
        }

        // No open filter bar found. Return false.
        return false;
    }

    function initCatFilters() {
        initDatePickers();
        initRangeFilters();

        $scope.categories.forEach(function (category) {
            category.hasFilters = (category.ascent && category.ascent.values.length > 1) || (category.begin_date !== undefined) || (category.difficulty && category.difficulty.values.length > 1) || (category.duration && category.duration.values.length > 1) || (category.eLength && category.eLength.values.length > 1) || (category.end_date !== undefined) || (category.route && category.route.values.length > 0) || (category.type1 && category.type1.values.length > 0) || (category.type2 && category.type2.values.length > 0);
        });
    }

    function customSort (array) {
        if (!(array instanceof Array)) throw "TypeError: parameter 1 is not of type 'Array'";

        var input  = [[], array];
        var output = [];
        var length = input[1].length;

        input[0]   = input[1].splice(0, Math.ceil(length/2));

        for (var i = 0 ; i < length ; i++) {
            output.push(input[i%2].shift());
        }

        return output;
    }

    function initFiltersView() {
        filtersService.initFilters()
            .then(
                function (filters) {
                    filters.themes = _.sortBy(filters.themes, 'label');

                    filters.themes.forEach(function (theme, index) {
                        theme.baseOrder = index;
                    });

                    filters.themes = customSort(filters.themes);

                    $scope.filters = filters;
                    $rootScope.activeFilters = filtersService.getActiveFilters();
                    if (globalSettings.SHOW_FILTERS_ON_MAP) {
                        updateFiltersTags();
                    }
                    $rootScope.$broadcast('updateFilters');
                }
            );
    }

    loadCategories();
    initFiltersView();

    var rootScopeEvents = [
        $rootScope.$on('updateFilters', function(name, forceRefresh) {
            if (!forceRefresh) {
                initCatFilters();
            }
        }),
        $rootScope.$on('switchGlobalLang', function () {
            loadCategories(true, function() {
                initFiltersView();
                $scope.foldCategories();
            });
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

    // popup opening
    $scope.open = function open () {
        $timeout(function () {
            $scope.opened = true;
        });
    };

    /**
     * Called when user clicks the "Reset filters" link, on the right hand side of
     * category tabs.
     */
    $scope.resetFilters = function resetFilters () {
        $scope.closeCategoryFilters();
        $rootScope.$broadcast('resetFilters');
    };
}

module.exports = {
    CategoriesListeController: CategoriesListeController
};

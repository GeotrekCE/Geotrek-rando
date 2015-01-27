'use strict';

function filtersService(globalSettings) {

    var self = this;

    this.createTouristicCategoryFilters = function (categories) {

        if (!this.filters) {
            this.initGlobalFilters();
        }

        _.forEach(categories, function (category) {
            var newCategory = {
                label: category.label,
                id: category.id,
                type1: [],
                type2: []
            };

            if (category.type1 && category.type1.length > 0) {
                newCategory.type1 = category.type1;
            }

            if (category.type2 && category.type2.length > 0) {
                newCategory.type2 = category.type2;
            }

            if (category.id === 80085) {
                newCategory.difficulty = [];
                if (category.difficulties && category.difficulties.length > 0) {
                    newCategory.difficulty = category.difficulties;
                }
                newCategory.duration = globalSettings.FILTERS.DURATION;
                newCategory.ascent = globalSettings.FILTERS.ASCENT;
            }

            self.filters.categories.push(newCategory);
        });

    };

    this.initGlobalFilters = function (results) {

        if (!this.filters) {
            this.filters = {
                categories:     [],
                themes:         [],
                districts:      [],
                valley:         [],
                search:         ''
            };
        }

        if (results !== undefined) {

            _.forEach(results, function (result) {

                if (result.properties.themes && result.properties.themes.length > 0) {
                    _.forEach(result.properties.themes, function (theme) {
                        if (self.filters.themes.indexOf(theme.id) === -1 && theme.code !== undefined) {
                            self.filters.themes.push(theme.id);   
                        }
                    });
                }

                if (result.properties.districts && result.properties.districts.length > 0) {
                    _.forEach(result.properties.districts, function (district) {
                        if (self.filters.districts.indexOf(district.code) === -1 && district.code !== undefined) {
                            self.filters.districts.push(district.code);   
                        }
                    });
                }

                if (result.properties.areas && result.properties.areas.length > 0) {
                    _.forEach(result.properties.areas, function (valley) {
                        if (self.filters.valley.indexOf(valley.code) === -1 && valley.code !== undefined) {
                            self.filters.valley.push(valley.code);   
                        }
                    });
                }
                
            });
        }

        console.log(this.filters);

    };

    this.getFiltersValue = function () {

        if (this.filters) {
            return this.filters;
        }

        this.initFilters();
    };

    this.filterResults = function (results) {
        var filteredResults;

        filteredResults = _.filter(results, function (result) {
            _.forEach(this.filters, function (filter) {
                if (true) {

                }
            });
        });

        return filteredResults;
    };

}

module.exports = {
    filtersService : filtersService
};
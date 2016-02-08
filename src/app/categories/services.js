'use strict';

function categoriesService(globalSettings, $q, treksService, contentsService, eventsService, utilsFactory, translationService) {
    var self = this;

    self._categoriesList = {};
    self._filteredCategoriesList = {};

    this.replaceImgURLs = function replaceImgURLs (categoriesData) {

        // Parse trek pictures, and change their URL
        _.forEach(categoriesData, function (category) {
            if (category.pictogram) {
                category.pictogram = globalSettings.API_URL + category.pictogram;
            }
        });

        return categoriesData;
    };

    this.getTreksCategories = function getTreksCategories (treks) {

        var treksCategories = [];

        _.forEach(treks.features, function (aTrek) {

            if (aTrek.properties.published) {

                if (!(utilsFactory.idIsInArray(treksCategories, aTrek.properties.category))) {

                    var currentCategory = {
                        id: angular.copy(aTrek.properties.category.id),
                        type: 'treks',
                        label: angular.copy(aTrek.properties.category.label),
                        order: angular.copy(aTrek.properties.category.order),
                        pictogram: angular.copy(aTrek.properties.category.pictogram),
                        type1_label: angular.copy(aTrek.properties.category.type1_label),
                        type2_label: angular.copy(aTrek.properties.category.type2_label),
                        type1: {type: 'checkbox', values: angular.copy(aTrek.properties.type1) || []},
                        type2: {type: 'checkbox', values: angular.copy(aTrek.properties.type2) || []},
                        route: {type: 'checkbox', values: [angular.copy(aTrek.properties.route)] || []},
                        difficulty: {type: 'range', values: [angular.copy(aTrek.properties.difficulty)] || []},
                        duration: {type: 'range', values: globalSettings.DURATION_FILTER || []},
                        ascent: {type: 'range', values: globalSettings.ASCENT_FILTER || []},
                        eLength: {type: 'range', values: globalSettings.LENGTH_FILTER || []},
                        themes: {type: 'checkbox', values: angular.copy(aTrek.properties.themes) || []},
                        cat_class: 'category-' + aTrek.properties.category.id.toString()
                    };

                    currentCategory.duration.values = _.map(_.sortBy(currentCategory.duration.values, 'id'));
                    currentCategory.ascent.values = _.map(_.sortBy(currentCategory.ascent.values, 'id'));
                    currentCategory.eLength.values = _.map(_.sortBy(currentCategory.eLength.values, 'id'));

                    treksCategories.push(currentCategory);

                } else {

                    var catIndex = utilsFactory.findIndexOfId(treksCategories, aTrek.properties.category.id);

                    _.forEach(aTrek.properties.type1, function (aType) {

                        if (!(utilsFactory.idIsInArray(treksCategories[catIndex].type1.values, aType))) {

                            treksCategories[catIndex].type1.values.push(aType);

                        }

                    });

                    _.forEach(aTrek.properties.type2, function (aType) {

                        if (!(utilsFactory.idIsInArray(treksCategories[catIndex].type2.values, aType))) {

                            treksCategories[catIndex].type2.values.push(aType);

                        }

                    });

                    if (aTrek.properties.route) {
                        if (!(utilsFactory.idIsInArray(treksCategories[catIndex].route.values, aTrek.properties.route))) {
                            treksCategories[catIndex].route.values.push(aTrek.properties.route);
                        }
                    }

                    if (aTrek.properties.difficulty) {
                        if (!(utilsFactory.idIsInArray(treksCategories[catIndex].difficulty.values, aTrek.properties.difficulty))) {
                            treksCategories[catIndex].difficulty.values.push(aTrek.properties.difficulty);
                        }
                        treksCategories[catIndex].difficulty.values = _.map(_.sortBy(treksCategories[catIndex].difficulty.values, 'id'));
                    }

                    if (aTrek.properties.themes && aTrek.properties.themes.length > 0) {
                        _.forEach(aTrek.properties.themes, function (theme) {

                            if (!(utilsFactory.idIsInArray(treksCategories[catIndex].themes.values, theme)) && theme !== undefined) {
                                treksCategories[catIndex].themes.values.push(theme);
                            }

                        });
                    }

                }

            }

        });

        return treksCategories;

    };

    this.getTouristicEventsCategories = function getTouristicEventsCategories (events) {

        var eventsType1 = {
                type: 'checkbox',
                values: []
            },
            themes = {
                type: 'checkbox',
                values: []
            };

        _.forEach(events.features, function (anEvent) {

            if (anEvent.properties.published) {

                if (anEvent.properties.type1 && anEvent.properties.type1.length > 0) {
                    _.forEach(anEvent.properties.type1, function (aType1) {
                        if (!(utilsFactory.idIsInArray(eventsType1.values, aType1)) && aType1 !== undefined) {
                            eventsType1.values.push(aType1);
                        }

                    });
                }

                if (anEvent.properties.themes && anEvent.properties.themes.length > 0) {
                    _.forEach(anEvent.properties.themes, function (theme) {

                        if (!(utilsFactory.idIsInArray(themes.values, theme)) && theme !== undefined) {
                            themes.values.push(theme);
                        }

                    });
                }
            }

        });

        var catInfos = events.features[0].properties.category;

        var eventsCategory = {
            id: catInfos.id,
            type: 'events',
            label: catInfos.label,
            order: catInfos.order,
            pictogram: catInfos.pictogram,
            type1_label: catInfos.type1_label,
            type1: eventsType1,
            begin_date: null,
            end_date: null,
            themes: themes,
            cat_class: 'category-' + catInfos.id.toString()
        };

        return eventsCategory;

    };

    this.getTouristicContentCategories = function getTouristicContentCategories (contents) {

        var contentsCategories = [];

        _.forEach(contents.features, function (aContent) {

            if (aContent.properties.published) {

                if (!(utilsFactory.idIsInArray(contentsCategories, aContent.properties.category))) {

                    var currentCategory = {
                        id: angular.copy(aContent.properties.category.id),
                        type: 'contents',
                        label: angular.copy(aContent.properties.category.label),
                        order: angular.copy(aContent.properties.category.order),
                        pictogram: angular.copy(aContent.properties.category.pictogram),
                        type1_label: angular.copy(aContent.properties.category.type1_label),
                        type2_label: angular.copy(aContent.properties.category.type2_label),
                        type1: {type: 'checkbox', values: angular.copy(aContent.properties.type1) || []},
                        type2: {type: 'checkbox', values: angular.copy(aContent.properties.type2) || []},
                        themes: {type: 'checkbox', values: angular.copy(aContent.properties.themes) || []},
                        cat_class: 'category-' + aContent.properties.category.id.toString()
                    };

                    contentsCategories.push(currentCategory);

                } else {

                    var catIndex = utilsFactory.findIndexOfId(contentsCategories, aContent.properties.category.id);

                    _.forEach(aContent.properties.type1, function (aType) {

                        if (!(utilsFactory.idIsInArray(contentsCategories[catIndex].type1.values, aType))) {

                            contentsCategories[catIndex].type1.values.push(aType);

                        }

                    });

                    _.forEach(aContent.properties.type2, function (aType) {

                        if (!(utilsFactory.idIsInArray(contentsCategories[catIndex].type2.values, aType))) {

                            contentsCategories[catIndex].type2.values.push(aType);

                        }

                    });

                    if (aContent.properties.themes && aContent.properties.themes.length > 0) {
                        _.forEach(aContent.properties.themes, function (theme) {

                            if (!(utilsFactory.idIsInArray(contentsCategories[catIndex].themes.values, theme)) && theme !== undefined) {
                                contentsCategories[catIndex].themes.values.push(theme);
                            }

                        });
                    }

                }

            }


        });

        return contentsCategories;

    };

    this.getNonExcludedCategories = function getNonExcludedCategories () {
        var lang = translationService.getCurrentLang();

        /**
         * If there is already a promise, return it
         */
        if (self._filteredCategoriesList[lang]) {
            return $q.when(self._filteredCategoriesList[lang]);
        }

        var deferred = $q.defer();

        self.getCategories()
            .then(function () {
                self._filteredCategoriesList[lang] = _.where(self._categoriesList[lang], { excluded: false });
            })
            .finally(function () {
                deferred.resolve(self._filteredCategoriesList[lang]);
            });

        return deferred.promise;
    };

    /**
     * Mark which category is excluded or not
     */
    this.preprocessCategories = function preprocessCategories () {
        var lang     = translationService.getCurrentLang();
        var excludes = globalSettings.LIST_EXCLUDE_CATEGORIES || [];

        if (self._categoriesList[lang] && self._categoriesList[lang].length) {
            simpleEach(self._categoriesList[lang], function (category) {
                category.excluded = !!(excludes.indexOf(category.id) > -1);
            });
        }
    };


    var getCategoriesPending = {};
    this.getCategories = function getCategories () {
        var lang = translationService.getCurrentLang();

        /**
         * If there is already a promise, return it
         */
        if (getCategoriesPending[lang]) {
            return getCategoriesPending[lang];
        }

        /**
         * Early return list of categories if it exists
         */
        if (self._categoriesList[lang] && self._categoriesList[lang].length) {
            return $q.when(self._categoriesList[lang]);
        }

        var deferred = $q.defer(),
            trekCats = null,
            contentCats = null,
            eventCat = null;

        var promises = [];

        if (globalSettings.ENABLE_TREKS) {
            promises.push(
                treksService.getTreks()
                    .then(
                        function (treks) {
                            if (treks.features.length > 0) {
                                trekCats = self.getTreksCategories(treks);
                            }
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {
            promises.push(
                contentsService.getContents()
                    .then(
                        function (contents) {
                            if (contents.features.length > 0) {
                                contentCats = self.getTouristicContentCategories(contents);
                            }
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            promises.push(
                eventsService.getEvents()
                    .then(
                        function (trEvents) {
                            if (trEvents.features.length > 0) {
                                eventCat = self.getTouristicEventsCategories(trEvents);
                            }
                        }
                    )

            );
        }

        $q.all(promises)
            .then(
                function () {
                    self._categoriesList[lang] = [];
                    if (globalSettings.ENABLE_TREKS && trekCats) {
                        for (var i = trekCats.length - 1; i >= 0; i--) {
                            self._categoriesList[lang].push(trekCats[i]);
                        }
                    }
                    if (globalSettings.ENABLE_TOURISTIC_CONTENT && contentCats) {
                        for (var j = contentCats.length - 1; j >= 0; j--) {
                            self._categoriesList[lang].push(contentCats[j]);
                        }
                    }
                    if (globalSettings.ENABLE_TOURISTIC_EVENTS && eventCat) {
                        self._categoriesList[lang].push(eventCat);
                    }

                    self.preprocessCategories();
                    deferred.resolve(self._categoriesList[lang]);
                    getCategoriesPending[lang] = false;
                }
            );

        getCategoriesPending[lang] = deferred.promise;
        return deferred.promise;

    };


}

module.exports = {
    categoriesService: categoriesService
};

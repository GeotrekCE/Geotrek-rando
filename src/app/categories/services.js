'use strict';

function categoriesService(globalSettings, $q, treksService, contentsService, eventsService, utilsFactory) {
    var self = this;

    this.replaceImgURLs = function (categoriesData) {

        // Parse trek pictures, and change their URL
        _.forEach(categoriesData, function (category) {
            if (category.pictogram) {
                category.pictogram = globalSettings.API_URL + category.pictogram;
            }
        });

        return categoriesData;
    };

    this.getTreksCategories = function (treks) {

        var treksCategories = [];

        _.forEach(treks.features, function (aTrek) {

            if (aTrek.properties.published) {

                if (!(utilsFactory.idIsInArray(treksCategories, aTrek.properties.category))) {

                    var currentCategory = {
                        id: aTrek.properties.category.id,
                        type: 'treks',
                        label: aTrek.properties.category.label,
                        order: aTrek.properties.category.order,
                        pictogram: aTrek.properties.category.pictogram,
                        type1_label: aTrek.properties.category.type1_label,
                        type2_label: aTrek.properties.category.type2_label,
                        type1: {type: 'checkbox', values: aTrek.properties.type1 || []},
                        type2: {type: 'checkbox', values: aTrek.properties.type2 || []},
                        route: {type: 'checkbox', values: [aTrek.properties.route] || []},
                        difficulty: {type: 'range', values: [aTrek.properties.difficulty] || []},
                        duration: {type: 'range', values: globalSettings.FILTERS.DURATION || []},
                        ascent: {type: 'range', values: globalSettings.FILTERS.ASCENT || []},
                        eLength: {type: 'range', values: globalSettings.FILTERS.LENGTH || []},
                        themes: {type: 'checkbox', values: aTrek.properties.themes || []},
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

    this.getTouristicEventsCategories = function (events) {

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
            themes: themes,
            cat_class: 'category-' + catInfos.id.toString()
        };

        return eventsCategory;

    };

    this.getTouristicContentCategories = function (contents) {

        var contentsCategories = [];

        _.forEach(contents.features, function (aContent) {

            if (aContent.properties.published) {

                if (!(utilsFactory.idIsInArray(contentsCategories, aContent.properties.category))) {

                    var currentCategory = {
                        id: aContent.properties.category.id,
                        type: 'contents',
                        label: aContent.properties.category.label,
                        order: aContent.properties.category.order,
                        pictogram: aContent.properties.category.pictogram,
                        type1_label: aContent.properties.category.type1_label,
                        type2_label: aContent.properties.category.type2_label,
                        type1: {type: 'checkbox', values: aContent.properties.type1 || []},
                        type2: {type: 'checkbox', values: aContent.properties.type2 || []},
                        themes: {type: 'checkbox', values: aContent.properties.themes || []},
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

    this.getNonExcludedCategories = function (forceRefresh) {
        var deferred = $q.defer(),
            filteredCategories = [];

        self.getCategories(forceRefresh)
            .then(
                function (categories) {
                    for (var i = categories.length - 1; i >= 0; i--) {
                        var category = categories[i];

                        if (globalSettings.LIST_EXCLUDE_CATEGORIES.indexOf(category.id) === -1) {
                            filteredCategories.push(category);
                        }
                    }
                    deferred.resolve(filteredCategories);
                },
                function (err) {
                    console.error(err);
                }
            );

        return deferred.promise;
    };

    this.getCategories = function (forceRefresh) {

        var deferred = $q.defer(),
            trekCats = null,
            contentCats = null,
            eventCat = null;

        if (self._categoriesList && !forceRefresh) {

            deferred.resolve(self._categoriesList);

        } else {

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
                        self._categoriesList = [];
                        if (globalSettings.ENABLE_TREKS && trekCats) {
                            for (var i = trekCats.length - 1; i >= 0; i--) {
                                self._categoriesList.push(trekCats[i]);
                            }
                        }
                        if (globalSettings.ENABLE_TOURISTIC_CONTENT && contentCats) {
                            for (var j = contentCats.length - 1; j >= 0; j--) {
                                self._categoriesList.push(contentCats[j]);
                            }
                        }
                        if (globalSettings.ENABLE_TOURISTIC_EVENTS && eventCat) {
                            self._categoriesList.push(eventCat);
                        }
                        deferred.resolve(self._categoriesList);
                    }
                );
        }

        return deferred.promise;

    };
}

module.exports = {
    categoriesService: categoriesService
};
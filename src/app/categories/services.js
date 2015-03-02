'use strict';

function categoriesService(globalSettings, $q, treksService, contentsService, eventsService, utilsFactory, filtersService) {
    var self = this;

    this.replaceImgURLs = function (categoriesData) {

        // Parse trek pictures, and change their URL
        _.forEach(categoriesData, function (category) {
            if (category.pictogram) {
                category.pictogram = globalSettings.DOMAIN + category.pictogram;
            }
        });

        return categoriesData;
    };

    this.getTreksCategories = function (treks) {

        var treksType1 = {
                type: 'checkbox',
                values: []
            },
            treksType2 = {
                type: 'checkbox',
                values: []
            },
            difficulty = {
                type: 'range',
                values: []
            },
            duration = {
                type: 'range',
                values: globalSettings.FILTERS.DURATION
            },
            ascent = {
                type: 'range',
                values: globalSettings.FILTERS.ASCENT
            },
            routes = {
                type: 'checkbox',
                values: []
            },
            themes = {
                type: 'checkbox',
                values: []
            };

        _.forEach(treks.features, function (aTrek) {

            if (aTrek.properties.published) {

                if (aTrek.properties.type1 && aTrek.properties.type1.length > 0) {
                    _.forEach(aTrek.properties.type1, function (aType1) {
                        if (!(utilsFactory.idIsInArray(treksType1.values, aType1)) && aType1 !== undefined) {
                            treksType1.values.push(aType1);
                        }

                    });
                }

                if (aTrek.properties.type2 && aTrek.properties.type2.length > 0) {
                    _.forEach(aTrek.properties.type2, function (aType2) {
                        if (!(utilsFactory.idIsInArray(treksType2.values, aType2)) && aType2 !== undefined) {
                            treksType2.values.push(aType2);
                        }

                    });
                }

                if (aTrek.properties.difficulty) {
                    if (!(utilsFactory.idIsInArray(difficulty.values, aTrek.properties.difficulty)) && aTrek.properties.difficulty !== undefined) {
                        difficulty.values.push(aTrek.properties.difficulty);
                    }
                }

                if (aTrek.properties.route) {
                    if (!(utilsFactory.idIsInArray(routes.values, aTrek.properties.route)) && aTrek.properties.route !== undefined) {
                        routes.values.push(aTrek.properties.route);
                    }
                }

                if (aTrek.properties.themes && aTrek.properties.themes.length > 0) {
                    _.forEach(aTrek.properties.themes, function (theme) {

                        if (!(utilsFactory.idIsInArray(themes.values, theme)) && theme !== undefined) {
                            themes.values.push(theme);
                        }

                    });
                }
            }

        });

        difficulty.values = _.map(_.sortBy(difficulty.values, 'id'));
        duration.values = _.map(_.sortBy(duration.values, 'id'));
        ascent.values = _.map(_.sortBy(ascent.values, 'id'));

        var catInfos = treks.features[0].properties.category;

        var treksCategory = {
            id: catInfos.id,
            label: catInfos.label,
            pictogram: catInfos.pictogram,
            type1_label: catInfos.type1_label,
            type2_label: catInfos.type2_label,
            type1: treksType1,
            type2: treksType2,
            difficulty: difficulty,
            duration: duration,
            ascent: ascent,
            routes: routes,
            themes: themes,
            cat_class: 'category-' + catInfos.id.toString()
        };

        return treksCategory;

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
            label: catInfos.label,
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
                        label: aContent.properties.category.label,
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

    this.getCategories = function () {

        var deferred = $q.defer(),
            trekCat,
            contentCats,
            eventCat;

        if (self._categoriesList) {

            deferred.resolve(self._categoriesList);

        } else {

            var promises = [];

            if (globalSettings.ENABLE_TREKS) {
                promises.push(
                    treksService.getTreks()
                        .then(
                            function (treks) {
                                trekCat = self.getTreksCategories(treks);
                            }
                        )
                );
            }

            if (globalSettings.ENABLE_TOURISTIC_CONTENT) {
                promises.push(
                    contentsService.getContents()
                        .then(
                            function (contents) {
                                contentCats = self.getTouristicContentCategories(contents);
                            }
                        )
                );
            }

            if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
                promises.push(
                    eventsService.getEvents()
                        .then(
                            function (trEvents) {
                                eventCat = self.getTouristicEventsCategories(trEvents);
                            }
                        )

                );
            }

            $q.all(promises)
                .then(
                    function () {
                        self._categoriesList = [];
                        if (globalSettings.ENABLE_TREKS) {
                            self._categoriesList.push(trekCat);
                        }
                        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {
                            _.forEach(contentCats, function (aContentsCat) {
                                self._categoriesList.push(aContentsCat);
                            });
                        }
                        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {

                            if (globalSettings.TOURISTIC_EVENTS_SPECIFIC_POSITION
                                    && typeof globalSettings.TOURISTIC_EVENTS_SPECIFIC_POSITION === 'number'
                                    && globalSettings.TOURISTIC_EVENTS_SPECIFIC_POSITION <= self._categoriesList.length) {
                                self._categoriesList.splice(globalSettings.TOURISTIC_EVENTS_SPECIFIC_POSITION - 1, 0, eventCat);
                            } else {
                                self._categoriesList.push(eventCat);
                            }

                        }
                        filtersService.createTouristicCategoryFilters(self._categoriesList);
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
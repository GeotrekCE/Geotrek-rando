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

        var treksUsages = [],
            difficulties = [],
            routes = [],
            themes = [];

        _.forEach(treks.features, function (aTrek) {

            if (aTrek.properties.published) {

                if (aTrek.properties.usages && aTrek.properties.usages.length > 0) {
                    _.forEach(aTrek.properties.usages, function (usage) {
                        if (!(utilsFactory.idIsInArray(treksUsages, usage)) && usage !== undefined) {
                            treksUsages.push(usage);
                        }

                    });
                }

                if (aTrek.properties.difficulty) {
                    if (!(utilsFactory.idIsInArray(difficulties, aTrek.properties.difficulty)) && aTrek.properties.difficulty !== undefined) {
                        difficulties.push(aTrek.properties.difficulty);
                    }
                }

                if (aTrek.properties.route) {
                    if (!(utilsFactory.idIsInArray(routes, aTrek.properties.route)) && aTrek.properties.route !== undefined) {
                        routes.push(aTrek.properties.route);
                    }
                }

                if (aTrek.properties.themes && aTrek.properties.themes.length > 0) {
                    _.forEach(aTrek.properties.themes, function (theme) {

                        if (!(utilsFactory.idIsInArray(themes, theme)) && theme !== undefined) {
                            themes.push(theme);
                        }

                    });
                }
            }

        });

        var treksCategory = {
            id: 80085,
            label: 'Randonnées',
            pictogram: './images/icons/trek-category.svg',
            type1_label: 'Type d\'usage',
            type2_label: 'Usage',
            type1: [],
            type2: treksUsages,
            difficulties: difficulties,
            routes: routes,
            themes: themes,
            cat_class: 'category-treks'
        };

        return treksCategory;

    };

    this.getTouristicEventsCategories = function (events) {

        var eventsUsages = [],
            themes = [];

        _.forEach(events.features, function (anEvent) {

            if (anEvent.properties.published) {
                if (!(utilsFactory.idIsInArray(eventsUsages, anEvent.properties.type))) {
                    eventsUsages.push(anEvent.properties.type);
                }

                if (anEvent.properties.themes && anEvent.properties.themes.length > 0) {
                    _.forEach(anEvent.properties.themes, function (theme) {

                        if (!(utilsFactory.idIsInArray(themes, theme)) && theme !== undefined) {
                            themes.push(theme);
                        }

                    });
                }
            }

        });

        var eventsCategory = {
            id: 54635,
            label: 'Evènements tourristiques',
            pictogram: './images/icons/events-category.svg',
            type1_label: 'Type d\'usage',
            type2_label: 'Type',
            type1: [],
            type2: eventsUsages,
            themes: themes,
            cat_class: 'category-events'
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
                        type1: aContent.properties.type1 || [],
                        type2: aContent.properties.type2 || [],
                        themes: aContent.properties.themes || [],
                        cat_class: 'category-' + utilsFactory.removeDiacritics(aContent.properties.category.label.toLowerCase())
                    };

                    contentsCategories.push(currentCategory);

                } else {

                    var catIndex = utilsFactory.findIndexOfId(contentsCategories, aContent.properties.category.id);

                    _.forEach(aContent.properties.type1, function (aType) {

                        if (!(utilsFactory.idIsInArray(contentsCategories[catIndex].type1, aType))) {

                            contentsCategories[catIndex].type1.push(aType);

                        }

                    });

                    _.forEach(aContent.properties.type2, function (aType) {

                        if (!(utilsFactory.idIsInArray(contentsCategories[catIndex].type2, aType))) {

                            contentsCategories[catIndex].type2.push(aType);

                        }

                    });

                    if (aContent.properties.themes && aContent.properties.themes.length > 0) {
                        _.forEach(aContent.properties.themes, function (theme) {

                            if (!(utilsFactory.idIsInArray(contentsCategories[catIndex].themes, theme)) && theme !== undefined) {
                                contentsCategories[catIndex].themes.push(theme);
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

            self._categoriesList = [];
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
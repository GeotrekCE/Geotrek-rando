'use strict';

function categoriesService(globalSettings, $q, treksService, contentsService, eventsService, utilsFactory) {
    var self = this;

    this.findIndexofId = function (anArray, id) {
        var length = anArray.length, i;
        for (i = 0; i < length; i++) {
            if (anArray[i].id === id) {
                return i;
            }
        }
    };

    this.idInArray = function (anArray, usage) {

        var isInArray = false;

        _.forEach(anArray, function (arrayElement) {
            if (arrayElement.id === usage.id) {
                isInArray = true;
            }
        });

        return isInArray;
    };

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

        var treksUsages = [];

        _.forEach(treks.features, function (aTrek) {

            _.forEach(aTrek.properties.usages, function (usage) {

                if (!(self.idInArray(treksUsages, usage))) {
                    treksUsages.push(usage);
                }

            });

        });

        var treksCategory = {
            id: 80085,
            label: 'Randonnées',
            pictogram: './images/icons/trek-category.svg',
            type1_label: 'Type d\'usage',
            type2_label: 'Usage',
            types: treksUsages,
            cat_class: 'category-treks'
        };

        return treksCategory;

    };

    this.getTouristicEventsCategories = function (events) {

        var eventsUsages = [];

        _.forEach(events.features, function (anEvent) {

            if (!(self.idInArray(eventsUsages, anEvent.type))) {
                eventsUsages.push(anEvent.type);
            }

        });

        var eventsCategory = {
            id: 54635,
            label: 'Evènements tourristiques',
            pictogram: './images/icons/events-category.svg',
            type1_label: 'Type d\'usage',
            type2_label: 'Type',
            types: eventsUsages,
            cat_class: 'category-events'
        };

        return eventsCategory;

    };

    this.getTouristicContentCategories = function (contents) {

        var contentsCategories = [];

        _.forEach(contents.features, function (aContent) {

            if (!(self.idInArray(contentsCategories, aContent.properties.category))) {

                var currentCategory = {
                    id: aContent.properties.category.id,
                    label: aContent.properties.category.label,
                    pictogram: aContent.properties.category.pictogram,
                    type1_label: aContent.properties.category.type1_label,
                    type2_label: aContent.properties.category.type2_label,
                    type1: aContent.properties.type1 || [],
                    type2: aContent.properties.type2 || [],
                    cat_class: 'category-' + utilsFactory.removeDiacritics(aContent.properties.category.label.toLowerCase())
                };

                contentsCategories.push(currentCategory);

            } else {

                var catIndex = self.findIndexofId(contentsCategories, aContent.properties.category.id);

                _.forEach(aContent.properties.type1, function (aType) {

                    if (!(self.idInArray(contentsCategories[catIndex].type1, aType))) {

                        contentsCategories[catIndex].type1.push(aType);

                    }

                });

                _.forEach(aContent.properties.type2, function (aType) {

                    if (!(self.idInArray(contentsCategories[catIndex].type2, aType))) {

                        contentsCategories[catIndex].type2.push(aType);

                    }

                });

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
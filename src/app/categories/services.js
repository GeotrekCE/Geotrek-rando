'use strict';

function categoriesService(globalSettings, $q, treksService, contentsService, eventsService) {
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

        angular.forEach(anArray, function (arrayElement) {
            if (arrayElement.id === usage.id) {
                isInArray = true;
            }
        });

        return isInArray;
    };

    this.replaceImgURLs = function (categoriesData) {

        // Parse trek pictures, and change their URL
        angular.forEach(categoriesData, function (category) {
            if (category.pictogram) {
                category.pictogram = globalSettings.DOMAIN + category.pictogram;
            }
        });

        return categoriesData;
    };

    this.getTreksCategories = function (treks) {

        var treksUsages = [];

        angular.forEach(treks.features, function (aTrek) {

            angular.forEach(aTrek.properties.usages, function (usage) {

                if (!(self.idInArray(treksUsages, usage))) {
                    treksUsages.push(usage);
                }

            });

        });

        var treksCategory = {
            id: 80085,
            label: 'Randonnées',
            pictogram: './images/trek-category.svg',
            type1_label: 'Type d\'usage',
            type2_label: 'Usage',
            types: treksUsages
        };

        return treksCategory;

    };

    this.getTouristicEventsCategories = function (events) {

        var eventsUsages = [];

        angular.forEach(events, function (anEvent) {

            if (!(self.idInArray(eventsUsages, anEvent.type))) {
                eventsUsages.push(anEvent.type);
            }

        });

        var eventsCategory = {
            id: 54635,
            label: 'Evènements tourristiques',
            pictogram: './images/events-category.svg',
            type1_label: 'Type d\'usage',
            type2_label: 'Type',
            types: eventsUsages
        };

        return eventsCategory;

    };

    this.getTouristicContentCategories = function (contents) {

        var contentsCategories = [];

        angular.forEach(contents, function (aContent) {

            if (!(self.idInArray(contentsCategories, aContent.category))) {

                var currentCategory = {
                    id: aContent.category.id,
                    label: aContent.category.label,
                    pictogram: aContent.category.pictogram,
                    type1_label: aContent.category.type1_label,
                    type2_label: aContent.category.type2_label,
                    type1: aContent.type1 || [],
                    type2: aContent.type2 || []
                };

                contentsCategories.push(currentCategory);

            } else {

                var catIndex = self.findIndexofId(contentsCategories, aContent.category.id);

                angular.forEach(aContent.type1, function (aType) {

                    if (!(self.idInArray(contentsCategories[catIndex].type1, aType))) {

                        contentsCategories[catIndex].type1.push(aType);

                    }

                });

                angular.forEach(aContent.type2, function (aType) {

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
                            angular.forEach(contentCats, function (aContentsCat) {
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
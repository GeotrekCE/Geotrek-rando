'use strict';

function categoriesService(settingsFactory, $resource, $q) {
    var self = this;

    this.replaceImgURLs = function (categoriesData) {        

        // Parse trek pictures, and change their URL
        angular.forEach(categoriesData, function(category) {
            if (category.pictogram) {
                category.pictogram = settingsFactory.DOMAIN + category.pictogram;
            }
        });

        return categoriesData;
    };

    this.getTreksCategory = function () {

        var trekCategory = {
            id: 80085,
            label: 'Treks',
        }

        self._categoriesList.push(trekCategory);

    };

    this.getTouristicEvents = function () {

        var eventsCategory = {
            id: 54635,
            label: 'Evènements tourristiques',
        }
        if (settingsFactory.TOURISTIC_EVENTS_SPECIFIC_POSITION 
            && typeof settingsFactory.TOURISTIC_EVENTS_SPECIFIC_POSITION === 'number' 
            && settingsFactory.TOURISTIC_EVENTS_SPECIFIC_POSITION <= self._categoriesList.length) {
            self._categoriesList.splice(settingsFactory.TOURISTIC_EVENTS_SPECIFIC_POSITION-1,0,eventsCategory);
        } else {
            self._categoriesList.push(eventsCategory);
        }

    };

    this.getCategories = function () {

        var deferred = $q.defer();

        if (self._categoriesList) {

            deferred.resolve(self._categoriesList);

        } else {
            var url = settingsFactory.categoriesUrl;

            self._categoriesList = [];

            if(settingsFactory.ENABLE_TOURISTIC_CONTENT) {
                var requests = $resource(url, {}, {
                    query: {
                        method: 'GET',
                        isArray: true,
                        cache: true
                    }
                },{stripTrailingSlashes: false});

                requests.query().$promise
                    .then(function (file) {
                        if (settingsFactory.ENABLE_TREKS) {
                            self.getTreksCategory();
                        }
                        var data = angular.fromJson(file);
                        var convertedData = self.replaceImgURLs(data);
                        angular.forEach(convertedData, function (category) {
                            if (category.id) {
                                self._categoriesList.push(category);
                            }
                        });
                        if (settingsFactory.ENABLE_TOURISTIC_EVENTS) {
                            self.getTouristicEvents();
                        }
                        deferred.resolve(self._categoriesList);
                    });
            } else {
                if (settingsFactory.ENABLE_TREKS) {
                    self.getTreksCategory();
                }
                if (settingsFactory.ENABLE_TOURISTIC_EVENTS) {
                    self.getTouristicEvents();
                }
                deferred.resolve(self._categoriesList);
            }

            

        }

        return deferred.promise;

    };
};

module.exports = {
    categoriesService: categoriesService
}
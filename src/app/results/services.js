'use strict';

function resultsService($q, $location, globalSettings, treksService, contentsService, eventsService, filtersService) {

    var self = this;

    this.getAllResults = function (forceRefresh) {
        var deferred = $q.defer(),
            promises = [],
            results = [];

        if (this._results && !forceRefresh) {
            deferred.resolve(this._results);
        }

        if (globalSettings.ENABLE_TREKS) {
            promises.push(
                treksService.getTreks(forceRefresh)
                    .then(
                        function (treks) {
                            _.forEach(treks.features, function (trek) {
                                if (trek.properties.published) {
                                    results.push(trek);
                                }
                            });
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {
            promises.push(
                contentsService.getContents(forceRefresh)
                    .then(
                        function (contents) {
                            _.forEach(contents.features, function (content) {
                                if (content.properties.published) {
                                    results.push(content);
                                }
                            });
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            promises.push(
                eventsService.getEvents(forceRefresh)
                    .then(
                        function (trEvents) {
                            _.forEach(trEvents.features, function (trEvent) {
                                var currentDate = new Date();
                                var eventDate = trEvent.properties.end_date || trEvent.properties.begin_date;
                                eventDate = new Date(eventDate);
                                if (trEvent.properties.published && eventDate > currentDate) {
                                    results.push(trEvent);
                                }
                            });
                        }
                    )

            );
        }

        $q.all(promises)
            .then(
                function () {
                    self._results = results;
                    deferred.resolve(results);
                }
            );

        return deferred.promise;
    };

    this.getAResultBySlug = function (elementSlug, categorySlug, forceRefresh) {
        var deferred = $q.defer();
        var findTrek = true, findContent = true, findEvent = true;
        if (globalSettings.ENABLE_TREKS) {
            treksService.getTreks(forceRefresh)
                .then(
                    function (treks) {
                        _.forEach(treks.features, function (trek) {
                            if (trek.properties.slug === elementSlug && trek.properties.category.slug === categorySlug) {
                                deferred.resolve(trek);
                            }
                        });
                        findTrek = null;
                        if (findTrek === null && findContent === null && findEvent === null) {
                            deferred.reject('No matching element found');
                        }
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {

            contentsService.getContents(forceRefresh)
                .then(
                    function (contents) {
                        _.forEach(contents.features, function (content) {
                            if (content.properties.slug === elementSlug && content.properties.category.slug === categorySlug) {
                                deferred.resolve(content);
                            }
                        });
                        findContent = null;
                        if (findTrek === null && findContent === null && findEvent === null) {
                            deferred.reject('No matching element found');
                        }
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            eventsService.getEvents(forceRefresh)
                .then(
                    function (trEvents) {
                        _.forEach(trEvents.features, function (trEvent) {
                            if (trEvent.properties.slug === elementSlug && trEvent.properties.category.slug === categorySlug) {
                                deferred.resolve(trEvent);
                            }
                        });
                        findEvent = null;
                        if (findTrek === null && findContent === null && findEvent === null) {
                            deferred.reject('No matching element found');
                        }
                    }
                );

        }

        return deferred.promise;
    };

    this.getAResultByID = function (elementID, categoryID, forceRefresh) {
        var deferred = $q.defer();
        var promises = [];
        var result = null;

        if (globalSettings.ENABLE_TREKS) {
            promises.push(
                treksService.getTreks(forceRefresh)
                    .then(
                        function (treks) {
                            _.forEach(treks.features, function (trek) {
                                if (trek.id === elementID && trek.properties.category.id === categoryID) {
                                    result = trek;
                                }
                            });
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {
            promises.push(
                contentsService.getContents(forceRefresh)
                    .then(
                        function (contents) {
                            _.forEach(contents.features, function (content) {
                                if (content.id === elementID && content.properties.category.id === categoryID) {
                                    result = content;
                                }
                            });
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            promises.push(
                eventsService.getEvents(forceRefresh)
                    .then(
                        function (trEvents) {
                            _.forEach(trEvents.features, function (trEvent) {
                                if (trEvent.id === elementID && trEvent.properties.category.id === categoryID) {
                                    result = trEvent;
                                }
                            });
                            
                        }
                    )
            );

        }

        $q.all(promises)
            .then(
                function () {
                    if (result) {
                        deferred.resolve(result);
                    } else {
                        deferred.reject('No matching element found');
                    }
                }
            );

        return deferred.promise;
    };

    this.getFilteredResults = function (forceRefresh) {
        var deferred = $q.defer(),
            filters = $location.search();

        if (!this._results || forceRefresh) {
            self.getAllResults(forceRefresh)
                .then(
                    function (results) {
                        self.filteredResults = [];
                        _.forEach(results, function (result) {
                            if (filtersService.filterElement(result, filters)) {
                                self.filteredResults.push(result);
                            }
                        });
                        deferred.resolve(self.filteredResults);
                    }
                );
        } else {
            self.filteredResults = [];
            _.forEach(self._results, function (result) {
                if (filtersService.filterElement(result, filters)) {
                    self.filteredResults.push(result);
                }
            });
            deferred.resolve(self.filteredResults);
        }

        return deferred.promise;
    };
}

module.exports = {
    resultsService: resultsService
};
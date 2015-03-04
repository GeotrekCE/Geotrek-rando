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
                                if (trEvent.properties.published) {
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

    this.getAResultBySlug = function (elementSlug, forceRefresh) {
        var deferred = $q.defer();

        if (globalSettings.ENABLE_TREKS) {
            treksService.getTreks(forceRefresh)
                .then(
                    function (treks) {
                        _.forEach(treks.features, function (trek) {
                            if (trek.properties.slug === elementSlug && trek.properties.published) {
                                deferred.resolve(trek);
                            }
                        });
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {

            contentsService.getContents(forceRefresh)
                .then(
                    function (contents) {
                        _.forEach(contents.features, function (content) {
                            if (content.properties.slug === elementSlug && content.properties.published) {
                                deferred.resolve(content);
                            }
                        });
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            eventsService.getEvents(forceRefresh)
                .then(
                    function (trEvents) {
                        _.forEach(trEvents.features, function (trEvent) {
                            if (trEvent.properties.slug === elementSlug && trEvent.properties.published) {
                                deferred.resolve(trEvent);
                            }
                        });
                    }
                );

        }

        return deferred.promise;
    };

    this.getAResultByID = function (elementID, categoryID, forceRefresh) {
        var deferred = $q.defer();

        if (globalSettings.ENABLE_TREKS && parseInt(categoryID, 10) === -2) {
            treksService.getTreks(forceRefresh)
                .then(
                    function (treks) {
                        _.forEach(treks.features, function (trek) {
                            if (parseInt(trek.id, 10) === parseInt(elementID, 10) && trek.properties.published) {
                                deferred.resolve(trek);
                            }
                        });
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT && parseInt(categoryID, 10) > 0) {

            contentsService.getContents(forceRefresh)
                .then(
                    function (contents) {
                        _.forEach(contents.features, function (content) {
                            if (parseInt(content.id, 10) === parseInt(elementID, 10) && parseInt(content.properties.category.id, 10) === parseInt(categoryID, 10) && content.properties.published) {
                                deferred.resolve(content);
                            }
                        });
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS && parseInt(categoryID, 10) === -1) {
            eventsService.getEvents(forceRefresh)
                .then(
                    function (trEvents) {
                        _.forEach(trEvents.features, function (trEvent) {
                            if (parseInt(trEvent.id, 10) === parseInt(elementID, 10) && trEvent.properties.published) {
                                deferred.resolve(trEvent);
                            }
                        });
                    }
                );

        }

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
'use strict';

function resultsService($q, $location, globalSettings, treksService, contentsService, eventsService) {

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
                                var currentDate = new Date().toISOString().substr(0, 10);
                                var eventDate = trEvent.properties.end_date || trEvent.properties.begin_date;
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
        var findTrek = true, findContent = true, findEvent = true;

        if (globalSettings.ENABLE_TREKS) {
            treksService.getTreks(forceRefresh)
                .then(
                    function (treks) {
                        _.forEach(treks.features, function (trek) {
                            if (trek.id === elementID && trek.properties.category.id === categoryID) {
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
                            if (content.id === elementID && content.properties.category.id === categoryID) {
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
                            if (trEvent.id === elementID && trEvent.properties.category.id === categoryID) {
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

    this.getRandomContentsByCategory = function (category, quantity) {
        var deferred = $q.defer();
        var parsedResults = [];
        var randomResults = [];

        if (!category) {
            deferred.reject('No category provided');
        }

        this.getAllResults()
            .then(
                function (results) {
                    _.forEach(results, function (result) {
                        var elementCategory = result.properties.category.id;
                        if (category === 'all' || category === elementCategory) {
                            parsedResults.push(result);
                        }
                    });
                    var max = quantity <= parsedResults.length - 1 ? parseInt(quantity) : parsedResults.length;
                    for (var i = max - 1; i >= 0; i--) {
                        var index = Math.floor(Math.random() * parsedResults.length);
                        randomResults.push(parsedResults[index]);
                        parsedResults.splice(index, 1);
                    }
                    if (randomResults.length === 0) {
                        deferred.reject('No matching category or no element in this category');
                    }
                    deferred.resolve(randomResults);

                }
            );

        return deferred.promise;
    };

}

module.exports = {
    resultsService: resultsService
};

'use strict';

function resultsService($q, globalSettings, treksService, contentsService, eventsService) {

    this.getAllResults = function () {
        var deferred = $q.defer(),
            promises = [],
            results = [];

        if (globalSettings.ENABLE_TREKS) {
            promises.push(
                treksService.getTreks()
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
                contentsService.getContents()
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
                eventsService.getEvents()
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
                    deferred.resolve(results);
                }
            );

        return deferred.promise;
    };

    this.getAResult = function (elementSlug) {
        var deferred = $q.defer();

        if (globalSettings.ENABLE_TREKS) {
            treksService.getTreks()
                .then(
                    function (treks) {
                        _.forEach(treks.features, function (trek) {
                            if (trek.properties.slug === elementSlug) {
                                deferred.resolve(trek);
                            }
                        });
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {

            contentsService.getContents()
                .then(
                    function (contents) {
                        _.forEach(contents.features, function (content) {
                            if (content.properties.slug === elementSlug) {
                                deferred.resolve(content);
                            }
                        });
                    }
                );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            eventsService.getEvents()
                .then(
                    function (trEvents) {
                        _.forEach(trEvents.features, function (trEvent) {
                            if (trEvent.properties.slug === elementSlug) {
                                deferred.resolve(trEvent);
                            }
                        });
                    }
                );

        }

        return deferred.promise;
    };
}

module.exports = {
    resultsService: resultsService
};
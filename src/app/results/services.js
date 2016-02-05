'use strict';

function resultsService($rootScope, $q, $location, globalSettings, treksService, contentsService, eventsService, translationService) {

    var getAllResultsPending = {};
    $rootScope.allResults = {};

    this.getAllResults = function getAllResults () {
        var lang = translationService.getCurrentLang();

        if (getAllResultsPending[lang]) return getAllResultsPending[lang];


        var deferred = $q.defer(),
            promises = [],
            results = [];

        if ($rootScope.allResults[lang]) {
            deferred.resolve($rootScope.allResults[lang]);
            getAllResultsPending[lang] = false;
            return deferred.promise;
        }

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
                    $rootScope.allResults[lang] = results;
                    deferred.resolve(results);
                    getAllResultsPending[lang] = false;
                }
            );

        getAllResultsPending[lang] = deferred.promise;
        return deferred.promise;
    };

    this.getAResultBySlug = function getAResultBySlug (elementSlug, categorySlug, forceRefresh) {
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

    this.getAResultByID = function getAResultByID (elementID, categoryID, forceRefresh) {
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

    this.getRandomContentsByCategory = function getRandomContentsByCategory (category, quantity) {
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

    this.lazyCheck = function () {
        /**
         * `this` should be bound by caller to jQlite element
         */
        simpleEach(this, function eachElement (element) {
            var pictures          = element.querySelectorAll('img[data-src]:not([src])');

            var $element          = jQuery(element);
            var elementTop        = $element.offset().top;
            var elementHeight     = $element.height();
            var elementBottom     = elementHeight + elementTop;
            var elementHalfHeight = elementHeight * 0.5;

            simpleEach(pictures, function eachPicture (picture) {
                var pictureTop = jQuery(picture).offset().top;
                var inView     = pictureTop >= (elementTop - elementHalfHeight) && pictureTop <= (elementBottom + elementHalfHeight);
                if (inView) {
                    picture.src = picture.getAttribute('data-src');
                }
            });
        });
    };

}

module.exports = {
    resultsService: resultsService
};

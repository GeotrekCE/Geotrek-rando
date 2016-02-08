'use strict';

function contentsService(globalSettings, settingsFactory, translationService, $q, $http) {

    var self = this;
    self._contentsList = {};

    this.refactorContent = function refactorContent (contentsData) {

        // Parse content pictures, and change their URL
        _.forEach(contentsData.features, function (content) {

            if (content.properties.category.pictogram) {
                content.properties.category.pictogram = globalSettings.API_URL + content.properties.category.pictogram;
            }
            if (content.properties.themes) {
                _.forEach(content.properties.themes, function (theme) {
                    if (theme.pictogram) {
                        theme.pictogram = globalSettings.API_URL + theme.pictogram;
                    }
                });
            }

            if (content.properties.type1) {
                _.forEach(content.properties.type1, function (aType1) {
                    if (aType1.pictogram) {
                        aType1.pictogram = globalSettings.API_URL + aType1.pictogram;
                    }
                });
            }
            if (content.properties.type2) {
                _.forEach(content.properties.type2, function (aType2) {
                    if (aType2.pictogram) {
                        aType2.pictogram = globalSettings.API_URL + aType2.pictogram;
                    }
                });
            }

            if (content.properties.map_image_url) {
                content.properties.map_image_url = globalSettings.API_URL + content.properties.map_image_url;
            }
            if (content.properties.filelist_url) {
                content.properties.filelist_url = globalSettings.API_URL + content.properties.filelist_url;
            }
            if (content.properties.printable) {
                content.properties.printable = globalSettings.API_URL + content.properties.printable;
            }
            if (content.properties.thumbnail) {
                content.properties.thumbnail = globalSettings.API_URL + content.properties.thumbnail;
            }
            if (content.properties.pictures) {
                if (content.properties.pictures.length) {
                    content.properties.picture = content.properties.pictures[0];
                }
                _.forEach(content.properties.pictures, function (picture) {
                    if (picture.url) {
                        picture.url = globalSettings.API_URL + picture.url;
                    }
                });
            }
            if (!content.uid) {
                content.uid = content.properties.category.id + '-' + content.id;
            }
            if (!content.luid) {
                var lang = translationService.getCurrentLang();
                content.luid = lang + '_' + content.properties.category.id + '-' + content.id;
            }
            content.properties.contentType = 'content';
        });
        return contentsData;
    };

    var getContentsPending = false;
    this.getContents = function getContents () {
        var lang = translationService.getCurrentLang();

        /**
         * If there is already a promise fetching contents, return it
         */
        if (getContentsPending) {
            return getContentsPending;
        }

        /**
         * If contents have already been fetched for current language, return them
         */
        if (self._contentsList[lang]) {
            return $q.when(self._contentsList[lang]);
        }

        /**
         * If contents have never been fetched for current language, fetch them
         */
        var deferred = $q.defer();
        var url      = settingsFactory.touristicUrl.replace(/\$lang/, lang);

        $http({url: url})
            .then(function (response) {
                var data = angular.fromJson(response.data);
                var refactoredContents = self.refactorContent(data);
                self._contentsList[lang] = refactoredContents;
                deferred.resolve(refactoredContents);
                getContentsPending = false;
            });


        getContentsPending = deferred.promise;
        return deferred.promise;

    };

}

function eventsService(globalSettings, settingsFactory, translationService, $http, $q) {

    var self = this;
    self._eventsList = {};

    this.refactorEvents = function refactorEvents (eventsData) {

        // Parse trEvent pictures, and change their URL
        _.forEach(eventsData.features, function (trEvent) {

            if (trEvent.properties.category.pictogram) {
                trEvent.properties.category.pictogram = globalSettings.API_URL + trEvent.properties.category.pictogram;
            }
            if (trEvent.properties.themes) {
                _.forEach(trEvent.properties.themes, function (theme) {
                    if (theme.pictogram) {
                        theme.pictogram = globalSettings.API_URL + theme.pictogram;
                    }
                });
            }
            if (trEvent.properties.type1) {
                _.forEach(trEvent.properties.type1, function (aType1) {
                    if (aType1.pictogram) {
                        aType1.pictogram = globalSettings.API_URL + aType1.pictogram;
                    }
                });
            }
            if (trEvent.properties.type2) {
                _.forEach(trEvent.properties.type2, function (aType2) {
                    if (aType2.pictogram) {
                        aType2.pictogram = globalSettings.API_URL + aType2.pictogram;
                    }
                });
            }
            if (trEvent.properties.map_image_url) {
                trEvent.properties.map_image_url = globalSettings.API_URL + trEvent.properties.map_image_url;
            }
            if (trEvent.properties.filelist_url) {
                trEvent.properties.filelist_url = globalSettings.API_URL + trEvent.properties.filelist_url;
            }
            if (trEvent.properties.printable) {
                trEvent.properties.printable = globalSettings.API_URL + trEvent.properties.printable;
            }
            if (trEvent.properties.thumbnail) {
                trEvent.properties.thumbnail = globalSettings.API_URL + trEvent.properties.thumbnail;
            }
            if (trEvent.properties.pictures) {
                if (trEvent.properties.pictures.length) {
                    trEvent.properties.picture = trEvent.properties.pictures[0];
                }
                _.forEach(trEvent.properties.pictures, function (picture) {
                    if (picture.url) {
                        picture.url = globalSettings.API_URL + picture.url;
                    }
                });
            }
            if (!trEvent.uid) {
                trEvent.uid = trEvent.properties.category.id + '-' + trEvent.id;
            }
            if (!trEvent.luid) {
                var lang = translationService.getCurrentLang();
                trEvent.luid = lang + '_' + trEvent.properties.category.id + '-' + trEvent.id;
            }
            trEvent.properties.contentType = 'event';

        });
        return eventsData;
    };

    var getEventsPending = false;
    this.getEvents = function getEvents () {
        var lang = translationService.getCurrentLang();

        /**
         * If there is already a promise fetching events, return it
         */
        if (getEventsPending) {
            return getEventsPending;
        }

        /**
         * If events have already been fetched for current language, return them
         */
        if (self._eventsList[lang]) {
            return $q.when(self._eventsList[lang]);
        }

        /**
         * If events have never been fetched for current language, fetch them
         */
        var deferred = $q.defer();

        if (true) {
            var url = settingsFactory.eventsUrl.replace(/\$lang/, lang);

            $http({url: url})
                .then(function (response) {
                    var data = angular.fromJson(response.data);
                    var refactoredEvents = self.refactorEvents(data);
                    self._eventsList[lang] = refactoredEvents;
                    deferred.resolve(refactoredEvents);
                    getEventsPending = false;
                });

        }

        getEventsPending = deferred.promise;
        return deferred.promise;

    };

}

module.exports = {
    contentsService: contentsService,
    eventsService: eventsService
};

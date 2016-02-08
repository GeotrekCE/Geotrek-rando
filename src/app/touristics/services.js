'use strict';

function contentsService(globalSettings, settingsFactory, translationService, $q, $http) {

    var self = this;
    self._contentsList = {};

    this.refactorContent = function refactorContent () {
        var lang = translationService.getCurrentLang();

        // Parse content pictures, and change their URL
        _.forEach(self._contentsList[lang].features, function (content) {

            /**
             * Content Type
             */
            content.properties.contentType = 'content';

            /**
             * Content IDs
             */
            content.uid  = content.uid  || content.properties.category.id + '-' + content.id;
            content.luid = content.luid || lang + '_' + content.properties.category.id + '-' + content.id;


            /**
             * Setup main picture (use `pictures[0]`)
             */
            if (content.properties.pictures && content.properties.pictures.length) {
                content.properties.picture = content.properties.pictures[0];
            }

            /**
            * Convert relative paths to absolute URL
            */
            _.forEach(content.properties.pictures, function (picture) {
                if (picture.url) {
                    picture.url = globalSettings.API_URL + picture.url;
                }
            });
            _.forEach(content.properties.type1, function (aType1) {
                if (aType1.pictogram) {
                    aType1.pictogram = globalSettings.API_URL + aType1.pictogram;
                }
            });
            _.forEach(content.properties.type2, function (aType2) {
                if (aType2.pictogram) {
                    aType2.pictogram = globalSettings.API_URL + aType2.pictogram;
                }
            });
            if (content.properties.category.pictogram) {
                content.properties.category.pictogram = globalSettings.API_URL + content.properties.category.pictogram;
            }
            _.forEach(content.properties.themes, function (theme) {
                if (theme.pictogram) {
                    theme.pictogram = globalSettings.API_URL + theme.pictogram;
                }
            });
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
        });
        return self._contentsList[lang];
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
                self._contentsList[lang] = angular.fromJson(response.data);
                self.refactorContent();
                deferred.resolve(self._contentsList[lang]);
                getContentsPending = false;
            });


        getContentsPending = deferred.promise;
        return deferred.promise;

    };

}

function eventsService(globalSettings, settingsFactory, translationService, $http, $q) {

    var self = this;
    self._eventsList = {};

    this.refactorEvents = function refactorEvents () {
        var lang = translationService.getCurrentLang();

        // Parse trEvent pictures, and change their URL
        _.forEach(self._eventsList[lang].features, function (trEvent) {

            /**
             * Content Type
             */
            trEvent.properties.contentType = 'event';

            /**
             * Content IDs
             */
            trEvent.uid  = trEvent.uid  || trEvent.properties.category.id + '-' + trEvent.id;
            trEvent.luid = trEvent.luid || lang + '_' + trEvent.properties.category.id + '-' + trEvent.id;

            /**
             * Setup main picture (use `pictures[0]`)
             */
            if (trEvent.properties.pictures && trEvent.properties.pictures.length) {
                trEvent.properties.picture = trEvent.properties.pictures[0];
            }

            /**
            * Convert relative paths to absolute URL
            */
            _.forEach(trEvent.properties.pictures, function (picture) {
                if (picture.url) {
                    picture.url = globalSettings.API_URL + picture.url;
                }
            });
            _.forEach(trEvent.properties.type1, function (aType1) {
                if (aType1.pictogram) {
                    aType1.pictogram = globalSettings.API_URL + aType1.pictogram;
                }
            });
            _.forEach(trEvent.properties.type2, function (aType2) {
                if (aType2.pictogram) {
                    aType2.pictogram = globalSettings.API_URL + aType2.pictogram;
                }
            });
            if (trEvent.properties.category.pictogram) {
                trEvent.properties.category.pictogram = globalSettings.API_URL + trEvent.properties.category.pictogram;
            }
            _.forEach(trEvent.properties.themes, function (theme) {
                if (theme.pictogram) {
                    theme.pictogram = globalSettings.API_URL + theme.pictogram;
                }
            });
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

        });

        return self._eventsList[lang];
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
        var url      = settingsFactory.eventsUrl.replace(/\$lang/, lang);

        $http({url: url})
            .then(function (response) {
                self._eventsList[lang] = angular.fromJson(response.data);
                self.refactorEvents();
                deferred.resolve(self._eventsList[lang]);
                getEventsPending = false;
            });

        getEventsPending = deferred.promise;
        return deferred.promise;

    };

}

module.exports = {
    contentsService: contentsService,
    eventsService: eventsService
};

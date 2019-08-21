'use strict';

function divesService(globalSettings, settingsFactory, translationService, $q, $http) {

    var self = this;
    self._divesList = {};

    this.refactorDives = function refactorDives () {
        var lang = translationService.getCurrentLang();

        // Parse dive pictures, and change their URL
        _.forEach(self._divesList[lang].features, function (dive) {

            /**
             * Dives Type
             */
            dive.properties.diveType = 'dive';

            /**
             * Dives IDs
             */
            dive.uid  = dive.uid  || dive.properties.category.id + '-' + dive.id;
            dive.luid = dive.luid || lang + '_' + dive.properties.category.id + '-' + dive.id;


            /**
             * Setup main picture (use `pictures[0]`)
             */
            if (dive.properties.pictures && dive.properties.pictures.length) {
                dive.properties.picture = dive.properties.pictures[0];
            }

            /**
            * Convert relative paths to absolute URL
            */
            _.forEach(dive.properties.pictures, function (picture) {
                if (picture.url) {
                    picture.url = globalSettings.API_URL + picture.url;
                }
            });
            if (dive.properties.category.pictogram) {
                dive.properties.category.pictogram = globalSettings.API_URL + dive.properties.category.pictogram;
            }
            if (dive.properties.difficulty && dive.properties.difficulty.pictogram) {
                dive.properties.difficulty.pictogram = globalSettings.API_URL + dive.properties.difficulty.pictogram;
            }
            _.forEach(dive.properties.levels, function (level) {
                if (level.pictogram) {
                    level.pictogram = globalSettings.API_URL + level.pictogram;
                }
            });
            _.forEach(dive.properties.themes, function (theme) {
                if (theme.pictogram) {
                    theme.pictogram = globalSettings.API_URL + theme.pictogram;
                }
            });
            if (dive.properties.map_image_url) {
                dive.properties.map_image_url = globalSettings.API_URL + dive.properties.map_image_url;
            }
            if (dive.properties.filelist_url) {
                dive.properties.filelist_url = globalSettings.API_URL + dive.properties.filelist_url;
            }
            if (dive.properties.printable) {
                dive.properties.printable = globalSettings.API_URL + dive.properties.printable;
            }
            if (dive.properties.thumbnail) {
                dive.properties.thumbnail = globalSettings.API_URL + dive.properties.thumbnail;
            }
        });
        return self._divesList[lang];
    };

    var getDivesPending = false;
    this.getDives = function getDives () {
        var lang = translationService.getCurrentLang();

        /**
         * If there is already a promise fetching dives, return it
         */
        if (getDivesPending) {
            return getDivesPending;
        }

        /**
         * If dives have already been fetched for current language, return them
         */
        if (self._divesList[lang]) {
            return $q.when(self._divesList[lang]);
        }

        /**
         * If dives have never been fetched for current language, fetch them
         */
        var deferred = $q.defer();
        var url      = settingsFactory.divesUrl.replace(/\$lang/, lang);

        $http({url: url})
            .then(function (response) {
                self._divesList[lang] = angular.fromJson(response.data);
                self.refactorDives();
                deferred.resolve(self._divesList[lang]);
                getDivesPending = false;
            });


        getDivesPending = deferred.promise;
        return deferred.promise;

    };

}

module.exports = {
    divesService: divesService
};

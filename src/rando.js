(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/app/app.js":[function(require,module,exports){
'use strict';

var dependencies = [
    // Our submodules
    'rando.config', 'rando.treks', 'rando.layout',

    // External stuff
    'ui.router', 'ngResource'
];

angular.module('geotrekRando', dependencies);

// Require Geotrek components
require('./config');
//require('./commons');
require('./layout');
require('./treks');
//require('./map');

},{"./config":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/index.js","./layout":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/index.js","./treks":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/index.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/factories.js":[function(require,module,exports){
'use strict';

function settingsFactory(globalSettings) {

    // CONSTANTS VAR that user can change
    //
    var DOMAIN = 'http://192.168.100.47:8888',

        //PATHS AND DIRECTORY
        FILES_DIR = 'files/api',
        TREK_DIR = 'trek',
        TILES_DIR = 'tiles',

        TREKS_FILE = 'trek.geojson';
        //POI_FILE = 'pois.geojson',


    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  DOMAIN + '/' + FILES_DIR + '/' + TREK_DIR + '/' + TREKS_FILE;

    //PUBLIC METHODS
    //
    var setLang = function (newLang) {
        _activeLang = newLang;
        return true;
    };

    var getLang = function () {
        return _activeLang;
    };



    return {
        //CONSTANTS
        DOMAIN: DOMAIN,

        //PUBLIC VAR
        treksUrl: treksUrl,

        //METHODS
        setLang: setLang,
        getLang: getLang

    };

}

module.exports = {
    settingsFactory: settingsFactory
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.config', [])
    .constant('globalSettings', {
        DEFAULT_LANGUAGE: 'fr'
    })
    .factory('settingsFactory', require('./factories').settingsFactory);
},{"./factories":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/factories.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/controllers.js":[function(require,module,exports){
'use strict';

function LayoutController($scope, treks) {
    $scope.treks = treks;
    console.log(treks);
}

function HeaderController() {
}

function SidebarController() {
}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarController: SidebarController,
    FooterController: FooterController
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.layout', ['ui.router', 'rando.treks'])
    .config(require('./routes').layoutRoutes)
    .run(require('./services').RunApp);
},{"./routes":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/routes.js","./services":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/services.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/routes.js":[function(require,module,exports){
'use strict';

var controller = require('./controllers');

function layoutRoutes($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('layout', {
            abstract: true,
            template: require('./templates/layout.html'),
            controller: controller.LayoutController,
            resolve: {
                treks : function(treksService) {
                    return treksService.getTreks();
                }
            }
        })
        .state('root', {
            parent: 'layout',
            url: '/',
            views: {
                'header' : {
                    template: require('./templates/header.html'),
                    controller: controller.HeaderController
                },
                'sidebar' : {
                    template: require('./templates/sidebar.html'),
                    controller: controller.SidebarController
                },
                'content' : {
                    template: require('./templates/content-home.html'),
                },
                'footer' : {
                    template: require('./templates/footer.html'),
                    controller: controller.FooterController
                },
            }

        });
}

module.exports = {
    layoutRoutes: layoutRoutes
};
},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/controllers.js","./templates/content-home.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/content-home.html","./templates/footer.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/footer.html","./templates/header.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/header.html","./templates/layout.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/layout.html","./templates/sidebar.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/sidebar.html"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/services.js":[function(require,module,exports){
'use strict';


function RunApp() {
    console.log('app started');
}

module.exports = {
    RunApp: RunApp
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/content-home.html":[function(require,module,exports){
module.exports = '<treks-liste></treks-liste>\n';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/footer.html":[function(require,module,exports){
module.exports = '<div class="container">\n\n</div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/header.html":[function(require,module,exports){
module.exports = '<div class="container" role="navigation">\n    <div id="logo">Logo</div>\n</div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/layout.html":[function(require,module,exports){
module.exports = '<div id="header" ui-view="header"></div>\n<div id="main-content" class="fluid-cotainer">\n    <div class="row">\n        <div id="sidebar" ui-view="sidebar" class="col-sm-1"></div>\n        <div ui-view="content" class="col-sm-11 content"></div>\n    </div>\n</div>\n<div id="footer" ui-view="footer"></div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/sidebar.html":[function(require,module,exports){
module.exports = '<div>\n</div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/controllers.js":[function(require,module,exports){
'use strict';

function TreksListeController($scope) {
    
}


module.exports = {
    TreksListeController: TreksListeController
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/directives.js":[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function treksListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/treks-liste.html'),
        controller: controllers.TreksListeController
    };
}

module.exports = {
    treksListeDirective: treksListeDirective
};

},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/controllers.js","./templates/treks-liste.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/templates/treks-liste.html"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.treks', [])
    .service('treksService', require('./services').treksService)
    .controller('TreksListeController', require('./controllers').TreksListeController)
    .directive('treksListe', require('./directives').treksListeDirective);
},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/controllers.js","./directives":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/directives.js","./services":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/services.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/services.js":[function(require,module,exports){
'use strict';

function treksService(settingsFactory, $resource, $q) {

    var self = this;

    this.replaceImgURLs = function (treksData) {        

        // Parse trek pictures, and change their URL
        angular.forEach(treksData.features, function(trek) {
            angular.forEach(trek.properties.pictures, function(picture) {
                picture.url = settingsFactory.DOMAIN + picture.url;
            });
            angular.forEach(trek.properties.usages, function(usage) {
                usage.pictogram = settingsFactory.DOMAIN + usage.pictogram;
            });
            angular.forEach(trek.properties.themes, function(theme) {
                theme.pictogram = settingsFactory.DOMAIN + theme.pictogram;
            });
            angular.forEach(trek.properties.networks, function(network) {
                network.pictogram = settingsFactory.DOMAIN + network.pictogram;
            });
            angular.forEach(trek.properties.information_desks, function(information_desk) {
                information_desk.photo_url = settingsFactory.DOMAIN + information_desk.photo_url;
            });
            trek.properties.thumbnail = settingsFactory.DOMAIN + trek.properties.thumbnail;
            trek.properties.difficulty.pictogram = settingsFactory.DOMAIN + trek.properties.difficulty.pictogram;
            trek.properties.altimetric_profile = settingsFactory.DOMAIN + trek.properties.altimetric_profile.replace(".json", ".svg");
        });
        return treksData;
    };

    this.getTreks = function () {

        var deferred = $q.defer();

        if (self._trekList) {

            deferred.resolve(self._trekList);

        } else {
            var url = settingsFactory.treksUrl;

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    cache: true
                }
            });

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var convertedImgs = self.replaceImgURLs(data);
                    self._trekList = convertedImgs;
                    deferred.resolve(convertedImgs);
                });

        }

        return deferred.promise;

    };

}

module.exports = {
    treksService: treksService
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/templates/treks-liste.html":[function(require,module,exports){
module.exports = '<section class="treks-liste">\n    <article ng-repeat="trek in treks.features" ng-id="trek-{{trek.id}}" class="trek col-sm-12 col-md-6">\n        <div class="visual">\n            <div class="fav-or-not">\n                <i class="glyphicon glyphicon-heart"></i>\n            </div>\n            <img ng-src="{{trek.properties.pictures[0].url}}" ng-alt="{{trek.properties.pictures[0].title}}">    \n        </div>\n        <h1 class="title">{{trek.properties.name}}</h1>\n        <div class="infos">\n            <span>{{trek.properties.districts[0].name}} - </span>\n            <span>{{trek.properties.duration_pretty}} - </span>\n            <span>Dénivelé {{trek.properties.ascent}} - </span>\n            <span>{{trek.properties.difficulty.label}} - </span>\n            <span>{{trek.properties.usages[0].label}}</span>\n        </div>\n        <ul class="themes">\n            <li ng-repeat="theme in trek.properties.themes">\n                <img ng-src="{{theme.pictogram}}" ng-alt="{{theme.label}}">\n            </li>\n        </ul>\n        <div class="know-more">\n            <span>+</span>\n        </div>\n\n    </article>\n</section>';
},{}]},{},["./src/app/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwL2FwcC5qcyIsInNyYy9hcHAvY29uZmlnL2ZhY3Rvcmllcy5qcyIsInNyYy9hcHAvY29uZmlnL2luZGV4LmpzIiwic3JjL2FwcC9sYXlvdXQvY29udHJvbGxlcnMuanMiLCJzcmMvYXBwL2xheW91dC9pbmRleC5qcyIsInNyYy9hcHAvbGF5b3V0L3JvdXRlcy5qcyIsInNyYy9hcHAvbGF5b3V0L3NlcnZpY2VzLmpzIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2NvbnRlbnQtaG9tZS5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2Zvb3Rlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2xheW91dC5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL3NpZGViYXIuaHRtbCIsInNyYy9hcHAvdHJla3MvY29udHJvbGxlcnMuanMiLCJzcmMvYXBwL3RyZWtzL2RpcmVjdGl2ZXMuanMiLCJzcmMvYXBwL3RyZWtzL2luZGV4LmpzIiwic3JjL2FwcC90cmVrcy9zZXJ2aWNlcy5qcyIsInNyYy9hcHAvdHJla3MvdGVtcGxhdGVzL3RyZWtzLWxpc3RlLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZXBlbmRlbmNpZXMgPSBbXG4gICAgLy8gT3VyIHN1Ym1vZHVsZXNcbiAgICAncmFuZG8uY29uZmlnJywgJ3JhbmRvLnRyZWtzJywgJ3JhbmRvLmxheW91dCcsXG5cbiAgICAvLyBFeHRlcm5hbCBzdHVmZlxuICAgICd1aS5yb3V0ZXInLCAnbmdSZXNvdXJjZSdcbl07XG5cbmFuZ3VsYXIubW9kdWxlKCdnZW90cmVrUmFuZG8nLCBkZXBlbmRlbmNpZXMpO1xuXG4vLyBSZXF1aXJlIEdlb3RyZWsgY29tcG9uZW50c1xucmVxdWlyZSgnLi9jb25maWcnKTtcbi8vcmVxdWlyZSgnLi9jb21tb25zJyk7XG5yZXF1aXJlKCcuL2xheW91dCcpO1xucmVxdWlyZSgnLi90cmVrcycpO1xuLy9yZXF1aXJlKCcuL21hcCcpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzZXR0aW5nc0ZhY3RvcnkoZ2xvYmFsU2V0dGluZ3MpIHtcblxuICAgIC8vIENPTlNUQU5UUyBWQVIgdGhhdCB1c2VyIGNhbiBjaGFuZ2VcbiAgICAvL1xuICAgIHZhciBET01BSU4gPSAnaHR0cDovLzE5Mi4xNjguMTAwLjQ3Ojg4ODgnLFxuXG4gICAgICAgIC8vUEFUSFMgQU5EIERJUkVDVE9SWVxuICAgICAgICBGSUxFU19ESVIgPSAnZmlsZXMvYXBpJyxcbiAgICAgICAgVFJFS19ESVIgPSAndHJlaycsXG4gICAgICAgIFRJTEVTX0RJUiA9ICd0aWxlcycsXG5cbiAgICAgICAgVFJFS1NfRklMRSA9ICd0cmVrLmdlb2pzb24nO1xuICAgICAgICAvL1BPSV9GSUxFID0gJ3BvaXMuZ2VvanNvbicsXG5cblxuICAgIC8vIFBSSVZBVEUgVkFSXG4gICAgLy9cbiAgICB2YXIgX2FjdGl2ZUxhbmcgPSBnbG9iYWxTZXR0aW5ncy5ERUZBVUxUX0xBTkdVQUdFO1xuXG5cbiAgICAvLyBQVUJMSUMgVkFSXG4gICAgLy9cbiAgICB2YXIgdHJla3NVcmwgPSAgRE9NQUlOICsgJy8nICsgRklMRVNfRElSICsgJy8nICsgVFJFS19ESVIgKyAnLycgKyBUUkVLU19GSUxFO1xuXG4gICAgLy9QVUJMSUMgTUVUSE9EU1xuICAgIC8vXG4gICAgdmFyIHNldExhbmcgPSBmdW5jdGlvbiAobmV3TGFuZykge1xuICAgICAgICBfYWN0aXZlTGFuZyA9IG5ld0xhbmc7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0TGFuZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9hY3RpdmVMYW5nO1xuICAgIH07XG5cblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy9DT05TVEFOVFNcbiAgICAgICAgRE9NQUlOOiBET01BSU4sXG5cbiAgICAgICAgLy9QVUJMSUMgVkFSXG4gICAgICAgIHRyZWtzVXJsOiB0cmVrc1VybCxcblxuICAgICAgICAvL01FVEhPRFNcbiAgICAgICAgc2V0TGFuZzogc2V0TGFuZyxcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZ1xuXG4gICAgfTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXR0aW5nc0ZhY3Rvcnk6IHNldHRpbmdzRmFjdG9yeVxufTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdyYW5kby5jb25maWcnLCBbXSlcbiAgICAuY29uc3RhbnQoJ2dsb2JhbFNldHRpbmdzJywge1xuICAgICAgICBERUZBVUxUX0xBTkdVQUdFOiAnZnInXG4gICAgfSlcbiAgICAuZmFjdG9yeSgnc2V0dGluZ3NGYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMnKS5zZXR0aW5nc0ZhY3RvcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigkc2NvcGUsIHRyZWtzKSB7XG4gICAgJHNjb3BlLnRyZWtzID0gdHJla3M7XG4gICAgY29uc29sZS5sb2codHJla3MpO1xufVxuXG5mdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKCkge1xufVxuXG5mdW5jdGlvbiBTaWRlYmFyQ29udHJvbGxlcigpIHtcbn1cblxuZnVuY3Rpb24gRm9vdGVyQ29udHJvbGxlcigpIHtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBMYXlvdXRDb250cm9sbGVyOiBMYXlvdXRDb250cm9sbGVyLFxuICAgIEhlYWRlckNvbnRyb2xsZXI6IEhlYWRlckNvbnRyb2xsZXIsXG4gICAgU2lkZWJhckNvbnRyb2xsZXI6IFNpZGViYXJDb250cm9sbGVyLFxuICAgIEZvb3RlckNvbnRyb2xsZXI6IEZvb3RlckNvbnRyb2xsZXJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgncmFuZG8ubGF5b3V0JywgWyd1aS5yb3V0ZXInLCAncmFuZG8udHJla3MnXSlcbiAgICAuY29uZmlnKHJlcXVpcmUoJy4vcm91dGVzJykubGF5b3V0Um91dGVzKVxuICAgIC5ydW4ocmVxdWlyZSgnLi9zZXJ2aWNlcycpLlJ1bkFwcCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29udHJvbGxlciA9IHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcblxuZnVuY3Rpb24gbGF5b3V0Um91dGVzKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnbGF5b3V0Jywge1xuICAgICAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGF5b3V0Lmh0bWwnKSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIuTGF5b3V0Q29udHJvbGxlcixcbiAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICB0cmVrcyA6IGZ1bmN0aW9uKHRyZWtzU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJla3NTZXJ2aWNlLmdldFRyZWtzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3Jvb3QnLCB7XG4gICAgICAgICAgICBwYXJlbnQ6ICdsYXlvdXQnLFxuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICdoZWFkZXInIDoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvaGVhZGVyLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlci5IZWFkZXJDb250cm9sbGVyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnc2lkZWJhcicgOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9zaWRlYmFyLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlci5TaWRlYmFyQ29udHJvbGxlclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2NvbnRlbnQnIDoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvY29udGVudC1ob21lLmh0bWwnKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdmb290ZXInIDoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvZm9vdGVyLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlci5Gb290ZXJDb250cm9sbGVyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbGF5b3V0Um91dGVzOiBsYXlvdXRSb3V0ZXNcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5cbmZ1bmN0aW9uIFJ1bkFwcCgpIHtcbiAgICBjb25zb2xlLmxvZygnYXBwIHN0YXJ0ZWQnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgUnVuQXBwOiBSdW5BcHBcbn07IiwibW9kdWxlLmV4cG9ydHMgPSAnPHRyZWtzLWxpc3RlPjwvdHJla3MtbGlzdGU+XFxuJzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XFxuXFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCIgcm9sZT1cIm5hdmlnYXRpb25cIj5cXG4gICAgPGRpdiBpZD1cImxvZ29cIj5Mb2dvPC9kaXY+XFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGlkPVwiaGVhZGVyXCIgdWktdmlldz1cImhlYWRlclwiPjwvZGl2PlxcbjxkaXYgaWQ9XCJtYWluLWNvbnRlbnRcIiBjbGFzcz1cImZsdWlkLWNvdGFpbmVyXCI+XFxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gICAgICAgIDxkaXYgaWQ9XCJzaWRlYmFyXCIgdWktdmlldz1cInNpZGViYXJcIiBjbGFzcz1cImNvbC1zbS0xXCI+PC9kaXY+XFxuICAgICAgICA8ZGl2IHVpLXZpZXc9XCJjb250ZW50XCIgY2xhc3M9XCJjb2wtc20tMTEgY29udGVudFwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGlkPVwiZm9vdGVyXCIgdWktdmlldz1cImZvb3RlclwiPjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdj5cXG48L2Rpdj4nOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVHJla3NMaXN0ZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVHJla3NMaXN0ZUNvbnRyb2xsZXI6IFRyZWtzTGlzdGVDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiB0cmVrc0xpc3RlRGlyZWN0aXZlKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLlRyZWtzTGlzdGVDb250cm9sbGVyXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHJla3NMaXN0ZURpcmVjdGl2ZTogdHJla3NMaXN0ZURpcmVjdGl2ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLnRyZWtzJywgW10pXG4gICAgLnNlcnZpY2UoJ3RyZWtzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS50cmVrc1NlcnZpY2UpXG4gICAgLmNvbnRyb2xsZXIoJ1RyZWtzTGlzdGVDb250cm9sbGVyJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLlRyZWtzTGlzdGVDb250cm9sbGVyKVxuICAgIC5kaXJlY3RpdmUoJ3RyZWtzTGlzdGUnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMnKS50cmVrc0xpc3RlRGlyZWN0aXZlKTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHRyZWtzU2VydmljZShzZXR0aW5nc0ZhY3RvcnksICRyZXNvdXJjZSwgJHEpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMucmVwbGFjZUltZ1VSTHMgPSBmdW5jdGlvbiAodHJla3NEYXRhKSB7ICAgICAgICBcblxuICAgICAgICAvLyBQYXJzZSB0cmVrIHBpY3R1cmVzLCBhbmQgY2hhbmdlIHRoZWlyIFVSTFxuICAgICAgICBhbmd1bGFyLmZvckVhY2godHJla3NEYXRhLmZlYXR1cmVzLCBmdW5jdGlvbih0cmVrKSB7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLnBpY3R1cmVzLCBmdW5jdGlvbihwaWN0dXJlKcKge1xuICAgICAgICAgICAgICAgIHBpY3R1cmUudXJsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIHBpY3R1cmUudXJsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLnVzYWdlcywgZnVuY3Rpb24odXNhZ2UpwqB7XG4gICAgICAgICAgICAgICAgdXNhZ2UucGljdG9ncmFtID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIHVzYWdlLnBpY3RvZ3JhbTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy50aGVtZXMsIGZ1bmN0aW9uKHRoZW1lKcKge1xuICAgICAgICAgICAgICAgIHRoZW1lLnBpY3RvZ3JhbSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB0aGVtZS5waWN0b2dyYW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrLnByb3BlcnRpZXMubmV0d29ya3MsIGZ1bmN0aW9uKG5ldHdvcmspwqB7XG4gICAgICAgICAgICAgICAgbmV0d29yay5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgbmV0d29yay5waWN0b2dyYW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrLnByb3BlcnRpZXMuaW5mb3JtYXRpb25fZGVza3MsIGZ1bmN0aW9uKGluZm9ybWF0aW9uX2Rlc2spwqB7XG4gICAgICAgICAgICAgICAgaW5mb3JtYXRpb25fZGVzay5waG90b191cmwgPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgaW5mb3JtYXRpb25fZGVzay5waG90b191cmw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRyZWsucHJvcGVydGllcy50aHVtYm5haWwgPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdHJlay5wcm9wZXJ0aWVzLnRodW1ibmFpbDtcbiAgICAgICAgICAgIHRyZWsucHJvcGVydGllcy5kaWZmaWN1bHR5LnBpY3RvZ3JhbSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5waWN0b2dyYW07XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMuYWx0aW1ldHJpY19wcm9maWxlID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIHRyZWsucHJvcGVydGllcy5hbHRpbWV0cmljX3Byb2ZpbGUucmVwbGFjZShcIi5qc29uXCIsIFwiLnN2Z1wiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cmVrc0RhdGE7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VHJla3MgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBpZiAoc2VsZi5fdHJla0xpc3QpIHtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzZWxmLl90cmVrTGlzdCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBzZXR0aW5nc0ZhY3RvcnkudHJla3NVcmw7XG5cbiAgICAgICAgICAgIHZhciByZXF1ZXN0cyA9ICRyZXNvdXJjZSh1cmwsIHt9LCB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVxdWVzdHMucXVlcnkoKS4kcHJvbWlzZVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gYW5ndWxhci5mcm9tSnNvbihmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbnZlcnRlZEltZ3MgPSBzZWxmLnJlcGxhY2VJbWdVUkxzKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl90cmVrTGlzdCA9IGNvbnZlcnRlZEltZ3M7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY29udmVydGVkSW1ncyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgfTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cmVrc1NlcnZpY2U6IHRyZWtzU2VydmljZVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8c2VjdGlvbiBjbGFzcz1cInRyZWtzLWxpc3RlXCI+XFxuICAgIDxhcnRpY2xlIG5nLXJlcGVhdD1cInRyZWsgaW4gdHJla3MuZmVhdHVyZXNcIiBuZy1pZD1cInRyZWste3t0cmVrLmlkfX1cIiBjbGFzcz1cInRyZWsgY29sLXNtLTEyIGNvbC1tZC02XCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmlzdWFsXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZhdi1vci1ub3RcIj5cXG4gICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWhlYXJ0XCI+PC9pPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxpbWcgbmctc3JjPVwie3t0cmVrLnByb3BlcnRpZXMucGljdHVyZXNbMF0udXJsfX1cIiBuZy1hbHQ9XCJ7e3RyZWsucHJvcGVydGllcy5waWN0dXJlc1swXS50aXRsZX19XCI+ICAgIFxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8aDEgY2xhc3M9XCJ0aXRsZVwiPnt7dHJlay5wcm9wZXJ0aWVzLm5hbWV9fTwvaDE+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5mb3NcIj5cXG4gICAgICAgICAgICA8c3Bhbj57e3RyZWsucHJvcGVydGllcy5kaXN0cmljdHNbMF0ubmFtZX19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLmR1cmF0aW9uX3ByZXR0eX19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPkTDqW5pdmVsw6kge3t0cmVrLnByb3BlcnRpZXMuYXNjZW50fX0gLSA8L3NwYW4+XFxuICAgICAgICAgICAgPHNwYW4+e3t0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5sYWJlbH19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLnVzYWdlc1swXS5sYWJlbH19PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8dWwgY2xhc3M9XCJ0aGVtZXNcIj5cXG4gICAgICAgICAgICA8bGkgbmctcmVwZWF0PVwidGhlbWUgaW4gdHJlay5wcm9wZXJ0aWVzLnRoZW1lc1wiPlxcbiAgICAgICAgICAgICAgICA8aW1nIG5nLXNyYz1cInt7dGhlbWUucGljdG9ncmFtfX1cIiBuZy1hbHQ9XCJ7e3RoZW1lLmxhYmVsfX1cIj5cXG4gICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICAgIDxkaXYgY2xhc3M9XCJrbm93LW1vcmVcIj5cXG4gICAgICAgICAgICA8c3Bhbj4rPC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuXFxuICAgIDwvYXJ0aWNsZT5cXG48L3NlY3Rpb24+JzsiXX0=

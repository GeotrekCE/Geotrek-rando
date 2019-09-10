'use strict'

describe('map  ', function() {
    var constants = require('../../../config/settings.default.json');
    var trekPath = element(by.css('.leaflet-map-pane .leaflet-overlay-pane svg.leaflet-zoom-animated g'));
    var nearMarkers = element(by.css('.leaflet-marker-pane .leaflet-marker-icon.near-marker'));
    var POIMarkers = element(by.css('.leaflet-marker-pane .leaflet-marker-icon.poi'));

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
        }, constants);
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });

    it('should have nearby elements on map', function () {
        browser.get('/#/itineraire/decouverte-de-la-cascade-dars/');

        element(by.css('.near-elements .detail-aside-group-title')).click();
        expect(nearMarkers.isPresent()).toBe(true);
    });

    it('should have POI elements on map', function () {
        browser.get('/#/itineraire/decouverte-de-la-cascade-dars/');

        element(by.css('.poi .detail-aside-group-title')).click();
        expect(POIMarkers.isPresent()).toBe(true);
    });

    it('should have a visible path on trek detail page', function () {
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');

        expect(trekPath.isPresent()).toBe(true);
    });

    it('should have a visible path on trek detail page after switch language', function () {
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');

        element(by.css('.languages .dropdown-toggle')).click();
        element(by.css('.languages .en a')).click();
        browser.driver.sleep(1);
        browser.waitForAngular();

        expect(trekPath.isPresent()).toBe(true);
    });

});

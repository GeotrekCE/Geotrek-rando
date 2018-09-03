'use strict'

describe('map  ', function() {
    var constants = require('../../../config/settings.default.json');
    var trekPath = element(by.css('.leaflet-map-pane .leaflet-overlay-pane svg.leaflet-zoom-animated g'));

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

    it('should have a visible path on trek detail page', function () {
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');

        expect(trekPath.isPresent()).toBe(true);
    });

    it('should have a visible path on trek detail page after switch language', function () {
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');

        element(by.css('.languages .active')).click();
        element(by.css('.languages .en a')).click();
        browser.driver.sleep(1);
        browser.waitForAngular();

        expect(trekPath.isPresent()).toBe(true);
    });
});

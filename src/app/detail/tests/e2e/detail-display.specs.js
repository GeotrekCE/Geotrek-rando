'use strict';

describe('Detail page ', function() {
    var titleSelector;
    var constants = require('../../../config/settings.default.json');

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
        }, constants);
    });

    it('should display a Touristic content page', function () {
        browser.get('/#/contenu-touristique/restaurant-de-test/');
        titleSelector = element(by.css('section.detail-page'));
        expect(titleSelector.getAttribute('class')).toMatch('category-C5');
    });

    it('should display a Touristic event page', function () {
        browser.get('/#/evenement-touristique/autrefois-le-couserans/');
        titleSelector = element(by.css('section.detail-page'));
        expect(titleSelector.getAttribute('class')).toMatch('category-E');
    });

    it('should display a Trek page', function () {
        browser.get('/#/itineraire/decouverte-de-la-cascade-dars/');
        titleSelector = element(by.css('section.detail-page'));
        expect(titleSelector.getAttribute('class')).toMatch('category-T');
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });

});

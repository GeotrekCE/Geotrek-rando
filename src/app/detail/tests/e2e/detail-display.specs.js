'use strict';

describe('Detail page ', function() {
    var titleSelector;

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function () {
            localStorage.clear();
            localStorage.setItem('geotrek-rando-language', JSON.stringify({
                code: 'fr'
            }));
        });
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
'use strict';

describe('Test warning panel - ', function() {
    var panel, button;
    beforeAll(function () {
        browser.get('/');
        browser.executeScript(function () {
            localStorage.clear();
            localStorage.setItem('geotrek-rando-language', JSON.stringify({
                code: 'fr'
            }));
        });
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');

        button = element(by.css('.detail-actions .signal a'));
        panel = element(by.css('.warning-panel'));
    });

    it('should have the warning button on sidebar', function() {
        expect(button.isPresent()).toBe(true);
    });

    it('should have the warning pannel hidden', function() {
        expect(panel.isPresent()).toBe(true);
        expect(panel.getAttribute('class')).not.toMatch('opened');
    });

    it('should display panel on click', function() {

        button.click();
        expect(panel.getAttribute('class')).toMatch('opened');
    });
});

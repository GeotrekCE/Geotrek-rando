'use strict';

describe('Flat page ', function() {
    var pageContent;

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function () {
            localStorage.clear();
            localStorage.setItem('geotrek-rando-language', JSON.stringify({
                code: 'fr'
            }));
        });
    });

    it('should display', function () {
        browser.get('/#/informations/test/');
        pageContent = element(by.css('.flat-page h1'));
        expect(pageContent.getText()).not.toEqual('');
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });

});
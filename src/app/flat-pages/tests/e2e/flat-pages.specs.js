'use strict';

describe('Flat page ', function() {
    var pageContent;
    var constants = require('../../../config/settings.default.json');

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
        }, constants);
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

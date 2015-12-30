'use strict';
describe('Results list', function() {
    var constants = require('../../../config/settings.constant.json');

    beforeAll(function () {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', JSON.stringify({
                code: 'fr'
            }));
        }, constants);
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });

    it('should display 8 results when all categories are checked', function () {
        browser.get('/#/?categories=T&categories=C8&categories=C5&categories=C3&categories=E');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(8);
    });

    it('should display 1 result when C5 category is checked', function () {
        browser.get('/#/?categories=C5');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(1);
    });

    it('should display 2 results when C8 category is checked', function () {
        browser.get('/#/?categories=C8');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(2);
    });
});

'use strict';
describe('Results list', function() {
    var constants = require('../../../config/settings.default.json');

    beforeAll(function () {
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

    it('should display 3 results when T category is checked', function () {
        browser.get('/#/?categories=T');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(3);
    });

    it('should display 1 result when C3 category is checked', function () {
        browser.get('/#/?categories=C3');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(1);
    });

    it('should display 1 result when C5 category is checked', function () {
        browser.get('/#/?categories=C5');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(1);
    });

    it('should display 2 results when C8 category is checked', function () {
        browser.get('/#/?categories=C8');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(2);
    });

    it('should display 1 result when E category is checked', function () {
        browser.get('/#/?categories=E');
        expect(element.all(by.repeater('result in elements')).count()).toEqual(1);
    });
});

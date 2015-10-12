'use strict'

describe('Geotrek random home', function() {
    var constants = require('../../app/config/settings.constant.json');

    beforeAll(function() {
        browser.get('/');
    });

    it('should display home only if SHOW_HOME is true', function () {
        expect(
            element(by.id('home-page')).isPresent()
        ).toBe(constants.SHOW_HOME);
    });


    it('should have random elements displayed', function () {
        var numberOfRandomElements = element.all(by.repeater('content in randomContents')).count();

        expect(numberOfRandomElements).toBeGreaterThan(0);
    });

});

'use strict'

describe('Home page ', function() {
    var constants = require('../../../config/settings.constant.json');

    beforeAll(function() {
        browser.get('/');
    });

    it('should display if SHOW_HOME is true in config', function () {
        expect(
            element(by.id('home-page')).isPresent()
        ).toBe(constants.SHOW_HOME);
    });


    it('should have random elements displayed', function () {
        var numberOfRandomElements = element.all(by.repeater('content in randomContents')).count();

        expect(numberOfRandomElements).toBeGreaterThan(0);
    });

});

'use strict'

describe('Geotrek constants consistency', function() {
    var constants = require('../../app/config/settings.constant.json');

    beforeAll(function() {
        browser.get('/#/no-homme');
    });

    it('should display footer only if SHOW_FOOTER is true', function () {
        expect(
            element(by.id('main-content')).element(by.id('footer')).isPresent()
        ).toBe(constants.SHOW_FOOTER);
    });


    it('should build language menu according AVAILABLE_LANGUAGES constant', function () {
        var constantLanguagesArrayLength = constants.ENABLED_LANGUAGES.length;
        var expectedLanguagesMenuItems   = (constantLanguagesArrayLength > 1) ? constantLanguagesArrayLength : 0;

        expect(
            element.all(by.repeater('lang in languages')).count()
        ).toEqual(expectedLanguagesMenuItems);
    });

});

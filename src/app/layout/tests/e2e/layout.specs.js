'use strict';
describe('Geotrek app ', function() {
    var constants = require('../../../config/settings.default.json');

    beforeAll(function() {
        browser.get('/');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Geotrek Rando');
    });


    it('should redirect to default categories after loading', function () {
        var location = '?categories=' + constants.DEFAULT_ACTIVE_CATEGORY;

        expect(browser.getLocationAbsUrl()).toMatch("/" + location);
    });

});

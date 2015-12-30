'use strict';
describe('Geotrek app ', function() {
    var constants = require('../../../config/settings.constant.json');

    beforeAll(function() {
        browser.get('/');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Geotrek Rando');
    });


    it('should redirect to default categories after loading', function () {
        var location = '?';
        for (var i = constants.DEFAULT_ACTIVE_CATEGORIES.length - 1; i >= 0; i--) {
            location += 'categories=' + constants.DEFAULT_ACTIVE_CATEGORIES[i];
        }
        expect(browser.getLocationAbsUrl()).toMatch("/" + location);
    });

});

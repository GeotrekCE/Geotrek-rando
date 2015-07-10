describe('Geotrek default tests', function() {
    var constants = require('../../app/config/configs').constants;

    beforeAll(function() {
        browser.get('/');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Geotrek Rando');
    });


    it('should redirect to default cat', function () {
        var location = '?';
        for (var i = constants.DEFAULT_ACTIVE_CATEGORIES.length - 1; i >= 0; i--) {
            location += 'categories=' + constants.DEFAULT_ACTIVE_CATEGORIES[i];
        };
        expect(browser.getLocationAbsUrl()).toMatch("/" + location);
    });

});

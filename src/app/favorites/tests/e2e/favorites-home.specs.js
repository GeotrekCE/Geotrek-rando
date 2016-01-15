'use strict';
describe('Favorites on home ', function() {
    var constants = require('../../../config/settings.constant.json');

    beforeAll(function() {
        browser.get('/#/no-homme');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
            localStorage.setItem(constants.PLATFORM_ID + '-favorites', JSON.stringify({
                'T-2': {
                    id: 2,
                    category: 'T'
                },
                'T-2849': {
                    id: 2849,
                    category: 'T'
                }
            }));
        }, constants);
    });

    it('should contain 2 favorites', function () {
        browser.get('/#/no-homme');
        var favs = element.all(by.css('.isFav'));
        expect(favs.count()).toEqual(2);
    });

    it('should contain 1 favorite if we click on the heart of one of them ', function () {
        var favs = element.all(by.css('.isFav'));

        favs.first().click();

        expect(favs.count()).toEqual(1);
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });
});

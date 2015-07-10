describe('Trecks test data (actions)', function() {
    var constants = require('../../app/config/configs').constants;

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', JSON.stringify({
                code: 'fr'
            }));
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

    it('Two items should be favorited', function () {
        browser.get('/');
        var favs = element.all(by.css('.isFav'));
        expect(favs.count()).toEqual(2);
    });

    it('', function () {
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

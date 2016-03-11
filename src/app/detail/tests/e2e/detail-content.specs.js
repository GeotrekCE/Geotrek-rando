describe('Detail page ', function() {
    var constants = require('../../../config/settings.default.json');

    beforeAll(function () {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
        }, constants);
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });

    it('should have the right title', function() {
        expect(element(by.css('.element-title h1')).getText()).toEqual('Boucle du Pic des Trois Seigneurs');
    });

    it('title should have an icon', function() {
        expect(element(by.css('.element-title .cat-icon img')).isPresent()).toBe(true);
    });
});

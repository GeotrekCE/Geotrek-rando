describe('Trecks test data (detailed)', function() {

    beforeEach(function() {
        browser.get('/');
        browser.executeScript("localStorage.setItem('geotrek-rando-language', '{\"code\":\"fr\",\"label\":\"English\"}');");
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');
    });

    it('should have the right title', function() {
        expect(element(by.css('.element-title h1')).getText()).toEqual('Boucle du Pic des Trois Seigneurs');
    });

    it('title should have an icon', function() {
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');
        expect(element(by.css('.element-title .cat-icon svg')).isPresent()).toBe(true);
    });
});

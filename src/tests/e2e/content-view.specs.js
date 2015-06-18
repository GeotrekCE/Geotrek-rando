describe('Trecks test data (detailed)', function() {

    beforeAll(function () {
        browser.get('/');
        browser.executeScript(function () {
            localStorage.clear();
            localStorage.setItem('geotrek-rando-language', JSON.stringify({
                code: 'fr'
            }));
        });
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
        expect(element(by.css('.element-title .cat-icon svg')).isPresent()).toBe(true);
    });
});

describe('Trecks test data', function() {

    it('should have the right title', function() {
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');
        expect(element(by.css('.element-title h1')).getText()).toEqual('Boucle du Pic des Trois Seigneurs');
    });

    it('title should have an icon', function() {
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');
        expect(element(by.css('.element-title .cat-icon svg')).isPresent()).toBe(true);
    });

    it('should display 8 results when all categories are checked', function () {
        browser.get('/#/?categories=T&categories=C8&categories=C5&categories=C3&categories=E');
        expect(element.all(by.repeater('result in results')).count()).toEqual(8);
    });

    it('should display 1 result when C5 category is checked', function () {
        browser.get('/#/?categories=C5');
        expect(element.all(by.repeater('result in results')).count()).toEqual(1);
    });

    it('should display 2 results when C8 category is checked', function () {
        browser.get('/#/?categories=C8');
        expect(element.all(by.repeater('result in results')).count()).toEqual(2);
    });

});

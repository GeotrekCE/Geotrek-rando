describe('Trecks test data (content filtering)', function() {

    beforeAll(function () {
        browser.get('/');
        browser.executeScript("localStorage.clear(); localStorage.setItem('geotrek-rando-language', '{\"code\":\"fr\",\"label\":\"English\"}');");
    });

    afterAll(function () {
        browser.executeScript("localStorage.clear();");
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

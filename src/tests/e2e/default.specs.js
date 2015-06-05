describe('Geotrek default tests', function() {

    beforeEach(function() {
        browser.get('/');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Geotrek Rando');
    });


    it('should redirect to default cat', function () {
        expect(browser.getLocationAbsUrl()).toMatch("/?categories=T");
    });

});

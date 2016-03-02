'use strict'

describe('Home page ', function() {
    var constants = require('../../../config/settings.default.json');
    var homePage;

    beforeAll(function() {
        browser.get('/');

        homePage = element(by.id('home-page'));
    });

    beforeEach(function () {
        element(by.css('.header-title-link')).click();
    });

    it('should display if SHOW_HOME is true in config', function () {
        expect(homePage.isPresent()).toBe(constants.SHOW_HOME);
    });


    it('should have random elements displayed', function () {
        var numberOfRandomElements = element.all(by.repeater('content in randomContents')).count();

        expect(numberOfRandomElements).toBeGreaterThan(0);
    });

    it('should have categories prefilters', function () {
        var categoriesPrefilter = element.all(by.css('.suggested-contents-item'));

        expect(categoriesPrefilter.count()).toBeGreaterThan(0);
    });

    it('should work for a single category', function () {
        var categoriesPrefilter = element.all(by.css('.suggested-contents-item'));
        var category = categoriesPrefilter.first().getAttribute('data-categories');
        var browserUrl;

        categoriesPrefilter.first().click();

        browserUrl = browser.getCurrentUrl();
        expect(browserUrl).toMatch(category);
    });

    it('should work for multiple categories', function () {
        var categoriesPrefilter = element.all(by.css('.suggested-contents-item'));
        var categories = categoriesPrefilter.last().getAttribute('data-categories');
        var browserUrl;

        categoriesPrefilter.last().click();

        browserUrl = browser.getCurrentUrl();

        for (var i = categories.length - 1; i >= 0; i--) {
            expect(browserUrl).toMatch(categories[i]);
        };
    });

    it('should hide if we click on access button', function () {
        var accessButton = element(by.css('#home-page .hide-home'));

        accessButton.click();

        expect(homePage.isPresent()).toBe(false);
    });


});

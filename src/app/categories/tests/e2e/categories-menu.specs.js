'use strict'

describe('categories menu', function() {
    var constants = require('../../../config/settings.default.json');
    var categoriesMenu;

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
        }, constants);
        browser.get('/#/?no-home');

        categoriesMenu = element(by.css('.subheader .categories.tabs'));
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });

    it('should be present', function () {
        expect(categoriesMenu.isPresent()).toBe(true);
    });


    it('should contain categories', function () {
        var numberOfCategories = element.all(by.repeater('category in categories')).count();

        expect(numberOfCategories).toBeGreaterThan(0);
    });

    it('should open the filter bar when clicking on a category tab', function () {
        // Click on the C3 category tab to open its fitler bar.
        var c3CategoryButton = element(by.css('.subheader .categories.tabs .category-C3 .category-title'));
        c3CategoryButton.click();

        // Get C3's filter bar CSS class.
        var c3CategoryFilterBar = element(by.css('.subheader .categories.filterBars li.category-C3'));
        var c3FilterBarClass = c3CategoryFilterBar.getAttribute('class');

        // Check that its classes contains 'open', proving it's open.
        expect(c3FilterBarClass).toMatch('open');
    });

    it('should close the filter bar when clicking on a category tab again', function () {
        // Click again on the C3 category tab that was already clicked once in the previous test.
        var c3CategoryButton = element(by.css('.subheader .categories.tabs .category-C3 .category-title'));
        c3CategoryButton.click();

        // Get C3's filter bar CSS class.
        var c3CategoryFilterBar = element(by.css('.subheader .categories.filterBars li.category-C3'));
        var c3FilterBarClass = c3CategoryFilterBar.getAttribute('class');

        // Check that its classes does not contain 'open', proving it's closed.
        expect(c3FilterBarClass).not.toMatch('open');
    });

    it('should only have one category open at the same time', function () {
        // Open category C5 by clicking its tab.
        var c5CategoryButton = element(by.css('.subheader .categories.tabs .category-C5 .category-title'));
        c5CategoryButton.click();

        // Now open category C8 by clicking its tab.
        var c8CategoryButton = element(by.css('.subheader .categories.tabs .category-C8 .category-title'));
        c8CategoryButton.click();

        // Get C5's filter bar CSS class.
        var c5CategoryFilterBar = element(by.css('.subheader .categories.filterBars li.category-C5'));
        var c5FilterBarClass = c5CategoryFilterBar.getAttribute('class');

        // Get C8's filter bar CSS class.
        var c8CategoryFilterBar = element(by.css('.subheader .categories.filterBars li.category-C8'));
        var c8FilterBarClass = c8CategoryFilterBar.getAttribute('class');

        // Check that C5's filter bar is closed.
        expect(c5FilterBarClass).not.toMatch('open');
        // Check that C8's filter bar is open.
        expect(c8FilterBarClass).toMatch('open');
    });

});

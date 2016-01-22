'use strict'

describe('categories menu ', function() {
    var constants = require('../../../config/settings.constant.json');
    var categoriesMenu, categoriesMenuWrapper;
    var EC = protractor.ExpectedConditions;

    beforeAll(function() {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
        }, constants);
        browser.get('/#/?no-home');

        categoriesMenu        = element(by.css('.sidebar .categories'));
        categoriesMenuWrapper = element(by.css('.sidebar .categories-wrapper'));

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

    it('should be closed by default', function () {
        var menuClassName = categoriesMenuWrapper.getAttribute('class');
        expect(menuClassName).not.toMatch('extend');
    });

    it('should open on click on menu button', function () {
        var menuButton = element(by.css('.sidebar .categories .categories-title'));
        var menuClassName;

        menuButton.click();
        menuClassName = categoriesMenuWrapper.getAttribute('class');

        expect(menuClassName).toMatch('extend');
    });

    it('should close on click on close button', function () {
        var closeButton = element(by.css('.sidebar .categories .categories-close button'));
        var menuClassName;

        browser.wait(EC.elementToBeClickable(closeButton), 2000);

        closeButton.click();

        menuClassName = categoriesMenuWrapper.getAttribute('class');
        expect(menuClassName).not.toMatch('extend');
    });

});

'use strict';

describe('Warning panel ', function() {
    var panel, openButton, closeButton, form, email, category, comment, location, submit;
    var constants = require('../../../config/settings.default.json');
    var activity, magnitudeProblem;
    beforeAll(function () {
        browser.get('/');
        browser.executeScript(function (constants) {
            localStorage.clear();
            localStorage.setItem(constants.PLATFORM_ID + '-language', 'fr');
        }, constants);
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');

        openButton = element(by.css('.detail-actions .signal a'));
        closeButton = element(by.css('.warning-panel .close'));
        panel        = element(by.css('.warning-panel'));
        form         = element(by.css('.warning-panel form'));
        email        = element(by.css('.warning-panel form #warning-email'));
        activity     = element(by.css('.warning-panel form #warning-activity'));
        category     = element(by.css('.warning-panel form #warning-category'));
        magnitudeProblem     = element(by.css('.warning-panel form #warning-magnitudeProblem'));
        comment      = element(by.css('.warning-panel form #warning-comment'));
        location     = element(by.css('.warning-panel form #warning-location'));
        submit       = element(by.css('.warning-panel form input[type="submit"]'));
    });

    it('should have the its button on page sidebar', function() {
        expect(openButton.isPresent()).toBe(true);
    });

    it('should be hidden by default', function() {
        expect(panel.isPresent()).toBe(true);
        expect(panel.getAttribute('class')).not.toMatch('opened');
    });

    it('should display on click on the sidebar button', function() {
        openButton.click();
        expect(panel.getAttribute('class')).toMatch('opened');
    });

    it('should not validate if no fields are filled', function() {
        expect(form.getAttribute('class')).toMatch('ng-invalid');
    });

    it('should still not validate form', function() {
        expect(form.getAttribute('class')).toMatch('ng-invalid');
    });

    it('should not validate email field if invalid email patern', function() {
        expect(email.getAttribute('class')).toMatch('untouched');
        expect(email.getAttribute('class')).toMatch('ng-invalid');
        email.sendKeys('test');
        expect(email.getAttribute('class')).toMatch('ng-invalid');
    });

    it('should validate email field if valid email patern', function() {
        email.sendKeys('test@test.fr');
        expect(email.getAttribute('class')).toMatch('ng-valid');
    });

    it('should not display activity field', function() {
        expect(activity.isPresent()).toBe(true);
        activity.sendKeys(1);
    });

    it('should already have a value for category field', function() {
        expect(category.getAttribute('class')).toMatch('untouched');
        expect(category.getAttribute('class')).toMatch('ng-valid');
    });

    it('should not display magnitude problem field', function() {
        expect(magnitudeProblem.isPresent()).toBe(true);
        activity.sendKeys(1);
    });

    it('should validate comment field if not empty', function() {
        expect(comment.getAttribute('class')).toMatch('untouched');
        expect(comment.getAttribute('class')).toMatch('ng-invalid');
        comment.sendKeys('test comment');
        expect(comment.getAttribute('class')).toMatch('ng-valid');
    });

    it('should already have a value for location field', function() {
        expect(location.getAttribute('class')).toMatch('untouched');
        expect(location.getAttribute('class')).toMatch('ng-valid');
    });

    it('should now valid the form', function() {
        expect(form.getAttribute('class')).not.toMatch('ng-invalid');
    });

    it('should have a close button on panel', function() {
        expect(closeButton.isPresent()).toBe(true);
    });

    it('should hide on click on close button', function() {
        closeButton.click();
        expect(panel.getAttribute('class')).not.toMatch('opened');
    });

    afterAll(function () {
        browser.executeScript(function () {
            localStorage.clear();
        });
    });

});

'use strict';

describe('Test warning panel - ', function() {
    var panel, openButton, closeButton, form, name, email, category, comment, location, submit;
    beforeAll(function () {
        browser.get('/');
        browser.executeScript(function () {
            localStorage.clear();
            localStorage.setItem('geotrek-rando-language', JSON.stringify({
                code: 'fr'
            }));
        });
        browser.get('/#/itineraire/boucle-du-pic-des-trois-seigneurs/');

        openButton = element(by.css('.detail-actions .signal a'));
        closeButton = element(by.css('.warning-panel .close'));
        panel        = element(by.css('.warning-panel'));
        form         = element(by.css('.warning-panel form'));
        name         = element(by.css('.warning-panel form #warning-name'));
        email        = element(by.css('.warning-panel form #warning-email'));
        category     = element(by.css('.warning-panel form #warning-category'));
        comment      = element(by.css('.warning-panel form #warning-comment'));
        location     = element(by.css('.warning-panel form #warning-location'));
        submit       = element(by.css('.warning-panel form input[type="submit"]'));
    });

    it('should have the warning button on sidebar', function() {
        expect(openButton.isPresent()).toBe(true);
    });

    it('should have the warning pannel hidden', function() {
        expect(panel.isPresent()).toBe(true);
        expect(panel.getAttribute('class')).not.toMatch('opened');
    });

    it('should display panel on click', function() {
        openButton.click();
        expect(panel.getAttribute('class')).toMatch('opened');
    });

    it('should not validate if no fields filled', function() {
        expect(form.getAttribute('class')).toMatch('ng-invalid');
    });

    it('should validate name field if not empty', function() {
        expect(name.getAttribute('class')).toMatch('untouched');
        expect(name.getAttribute('class')).toMatch('ng-invalid');
        name.sendKeys('test');
        expect(name.getAttribute('class')).toMatch('ng-valid');
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

    it('should already have a value for category field', function() {
        expect(category.getAttribute('class')).toMatch('untouched');
        expect(category.getAttribute('class')).toMatch('ng-valid');
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

    it('should close panel on click on vlose button', function() {
        closeButton.click();
        expect(panel.getAttribute('class')).not.toMatch('opened');
    });

});

describe('rando.config', function () {
    var angular = require('angular');

    require('angular-mocks');

    require('../../src/app/config');

    beforeEach(angular.mock.module('rando.config'));

    describe('constants', function () {
        var gs;

        beforeEach(inject(function (_globalSettings_) {
            gs = _globalSettings_;
        }));

        it('ENABLE_HTML_MODE should be bool', function () {
            expect(typeof gs.ENABLE_HTML_MODE).toBe('boolean');
        });

        it('SHOW_HOME should be bool', function () {
            expect(typeof gs.SHOW_HOME).toBe('boolean');
        });

        it('SHOW_FOOTER should be bool', function () {
            expect(typeof gs.SHOW_FOOTER).toBe('boolean');
        });

    });
});

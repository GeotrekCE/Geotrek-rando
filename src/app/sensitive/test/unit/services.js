'use strict';

var chai = require('chai'),
    service,
    expect = chai.expect,
    helper = require('../../../commons/test-helper'),
    expect = helper.expect,
    spy = helper.spy,
    stub = helper.stub,
    treksService = require('../../services').treksService;

describe('Add class to treks', function () {
    
    var addClass, globalSettings, settingsFactory, $resource, $q, filtersService;

    beforeEach(function () {
        globalSettings = {};
        settingsFactory = {};
        $resource = {};
        $q = {};
        filtersService = {};    
    });

    it('should add category-treks value to the created cat_class property of each trek', function () {
        service = new treksService(globalSettings, settingsFactory, $resource, $q, filtersService);

        var treks = [
            {id: 1},
            {id: 2}
        ];

        var result = service.addCategoryClass(treks);
        expect(results[0].cat_class).to.equal('category-treks');
        expect(results[1].cat_class).to.equal('category-treks');

    });



});
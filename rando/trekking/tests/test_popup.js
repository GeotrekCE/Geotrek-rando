var helper = require('./djangocasper.js');

casper.test.comment('Welcome Popup tests');

helper.scenario('/',
    function() {
        this.test.assertExists('#flatpages li.home', 'Popup button is present');
    }
);
helper.run();
'use strict';

function facebookService() {
    return {
        share: function(options) {
            var FB = window.FB;
            FB.ui(options);
        }
    };
}

module.exports = {
    facebookService: facebookService
};

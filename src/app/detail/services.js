'use strict';

function detailService() {

    var self = this;

    this.hasInfos = function (obj, args) {
    // Retrn true if object contains at least one element of arguments
        var infos = 0;
        for (var i = 0; i < arguments.length; i++) {
            if (obj[arguments[i]] !== undefined && obj[arguments[i]] !== '') {
                infos++;
            }
        }
        return infos > 0;
    };

}

module.exports = {
    detailService: detailService
};

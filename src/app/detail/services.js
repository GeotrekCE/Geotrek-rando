'use strict';

function detailService() {

    this.hasInfos = function (obj) {
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

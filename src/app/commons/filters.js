'use strict';

function removeTags($filter) {

    return function (markup) {
        return markup.replace(/(<([^>]+)>)/ig,"");
    };

}

function isSVG($filter) {
    return function(file) {
        var regexp = /\.(svg)$/i;
        if (file) {
            if (file.toString().match(regexp)) {
                return true;
            }
        }

        return false;
    };
}

module.exports = {
    removeTags: removeTags,
    isSVG: isSVG
};

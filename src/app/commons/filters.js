'use strict';

function removeTags () {

    return function (markup) {
        return markup.replace(/(<([^>]+)>)/ig,"");
    };

}

function isSVG () {
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

function sanitizeData($filter, $sce) {
    return function(data, removeStyle) {
        if (removeStyle) {
            data = data.replace(/[a-zA-Z0-9\-\_]*style="[^\"]*"/gim, '');
        }
        return $sce.trustAsHtml(data);
    };
}

module.exports = {
    removeTags: removeTags,
    isSVG: isSVG,
    sanitizeData: sanitizeData
};

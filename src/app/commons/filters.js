'use strict';

function removeTags () {

    return function (markup) {
        return markup.replace(/(<([^>]+)>)/ig,"");
    };

}

function decodeEntities () {
    return function(str) {
        if(str && typeof str === 'string') {
            var element = document.createElement('div');
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
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

function hexToRgb() {
    return function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var obj = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;

        return obj.r + ',' + obj.g + ',' + obj.b;
    };
}


module.exports = {
    removeTags: removeTags,
    decodeEntities: decodeEntities,
    isSVG: isSVG,
    sanitizeData: sanitizeData,
    hexToRgb: hexToRgb
};

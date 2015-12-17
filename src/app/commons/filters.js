'use strict';

function removeTags($filter) {

    return function (markup) {
        return markup.replace(/(<([^>]+)>)/ig,"");
    };

}

module.exports = {
    removeTags: removeTags
};

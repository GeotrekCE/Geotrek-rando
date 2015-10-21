'use strict';

function detailDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-page.html'),
        controller: 'DetailController'
    };
}

function detailContent() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content.html')
    };
}

function detailContentMeta() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-meta.html')
    };
}

function detailContentPictures() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-pictures.html')
    };
}

function detailAside() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-aside.html')
    };
}

module.exports = {
    detailDirective:         detailDirective,
    detailContent:           detailContent,
    detailContentMeta:       detailContentMeta,
    detailContentPictures:   detailContentPictures,
    detailAside:             detailAside
};

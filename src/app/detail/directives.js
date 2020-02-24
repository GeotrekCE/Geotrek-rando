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

function detailContentMedia() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-media.html')
    };
}

function detailContentElevation() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-elevation.html')
    };
}

function detailContentFromTo() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-from-to.html')
    };
}

function detailContentEventsInfo() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-events-info.html')
    };
}

function detailContentDesks() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-desks.html')
    };
}

function detailContentRelated() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-content-related.html')
    };
}

function detailAside() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-aside.html')
    };
}

function detailSensitives() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-sensitives.html')
    };
}

module.exports = {
    detailDirective:         detailDirective,
    detailContent:           detailContent,
    detailContentMeta:       detailContentMeta,
    detailContentPictures:   detailContentPictures,
    detailContentMedia:      detailContentMedia,
    detailContentFromTo:     detailContentFromTo,
    detailContentEventsInfo: detailContentEventsInfo,
    detailContentElevation:  detailContentElevation,
    detailContentDesks:      detailContentDesks,
    detailContentRelated:    detailContentRelated,
    detailAside:             detailAside,
    detailSensitives:         detailSensitives
};

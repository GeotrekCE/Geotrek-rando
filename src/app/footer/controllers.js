'use strict';

function FooterController($scope, globalSettings) {
    $scope.footerTemplate = '/app/footer/templates/';
    if (globalSettings.FOOTER_TEMPLATE_FILE) {
        $scope.footerTemplate += '/custom/' + globalSettings.FOOTER_TEMPLATE_FILE;
    } else {
        $scope.footerTemplate += 'default-footer.html';
    }
}

module.exports = {
    FooterController: FooterController
};
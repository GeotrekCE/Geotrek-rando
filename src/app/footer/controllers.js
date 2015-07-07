'use strict';

function FooterController($scope, globalSettings) {
    if (globalSettings.FOOTER_TEMPLATE_FILE) {
        $scope.footerTemplate = '/app/custom/templates/' + globalSettings.FOOTER_TEMPLATE_FILE;
    } else {
        $scope.footerTemplate = '/app/footer/templates/default-footer.html';
    }
}

module.exports = {
    FooterController: FooterController
};

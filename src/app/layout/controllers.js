'use strict';

function LayoutController() {
}

function HeaderController() {
    jQuery('[data-toggle="tooltip"]').tooltip();
}

function SidebarHomeController() {
}

function SidebarDetailController($scope, $stateParams, utilsFactory, resultsService) {

    function getResultDetails() {
        resultsService.getAResult($stateParams.slug)
            .then(
                function (data) {
                    $scope.result = data;
                }
            );
    }

    getResultDetails();

    jQuery('[data-toggle="tooltip"]').tooltip();

}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarHomeController: SidebarHomeController,
    SidebarDetailController: SidebarDetailController,
    FooterController: FooterController
};
'use strict';

function LayoutController() {
}

function HeaderController() {
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
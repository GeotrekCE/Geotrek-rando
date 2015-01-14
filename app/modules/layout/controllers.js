'use strict';

function LayoutController($scope, treks) {
    $scope.treks = treks;
    console.log(treks);
}

function HeaderController() {
}

function SidebarController() {
}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarController: SidebarController,
    FooterController: FooterController
};
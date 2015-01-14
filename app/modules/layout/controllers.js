'use strict';

function LayoutController($rootScope, treks) {
    $rootScope.treks = treks;
    console.log('treks loaded : ');
    console.log(treks);
}

function HeaderController() {
    console.log('header loaded');
}

function SidebarController() {
    console.log('sidebar loaded');
}

function FooterController() {
    console.log('footer loaded');
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarController: SidebarController,
    FooterController: FooterController
};
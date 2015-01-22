'use strict';

function LayoutController() {
}

function HeaderController() {
    jQuery('[data-toggle="tooltip"]').tooltip();
}

function SidebarHomeController() {
}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarController: SidebarHomeController,
    FooterController: FooterController
};
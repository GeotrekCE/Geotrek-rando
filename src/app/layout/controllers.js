'use strict';

function LayoutController() {
}

function HeaderController() {
    jQuery('[data-toggle="tooltip"]').tooltip();
}

function SidebarHomeController() {
}

function SidebarDetailController() {
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
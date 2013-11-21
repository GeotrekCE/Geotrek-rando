$(document).ready(function (e) {

    if (showModal() && MOBILE === false) {
        $('#popup-home').modal()
                        .on('hidden', onPopupClose);
    }

    function showModal() {
        var alreadyShown = localStorage.getItem('popup-shown') === "yes",
            landingHome = /^\/[a-zA-Z_]{2,5}\/$/.test(window.location.pathname),
            noFilter = !window.location.hash;
        return !alreadyShown && landingHome && noFilter;
    }

    function onPopupClose() {
        localStorage.setItem('popup-shown', "yes");
    }
});

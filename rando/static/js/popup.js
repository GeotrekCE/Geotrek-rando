$(document).ready(function (e) {

    var $modal = $('#popup-home').modal({show: false});

    // Links not leaving page
    $("#popup-home #popup-body a:not([href^='http'])").click(function () {
        $modal.modal('hide');
        setTimeout(function () {
            window.trekFilter.load();
        }, 0);
    });
    // External links
    $("#popup-home #popup-body a[href^='http']").click(rememberMe);
    // Popup close
    $modal.on('hidden', rememberMe);

    if (showModal() && MOBILE === false) {
        $modal.modal('show');
    }

    function showModal() {
        var alreadyShown = localStorage.getItem('popup-shown') === "yes",
            landingHome = /^\/[a-zA-Z_]{2,5}\/$/.test(window.location.pathname),
            noFilter = !window.location.hash;
        return !alreadyShown && landingHome && noFilter;
    }

    function rememberMe() {
        localStorage.setItem('popup-shown', "yes");
    }
});

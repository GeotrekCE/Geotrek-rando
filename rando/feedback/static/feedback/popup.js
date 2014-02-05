$(document).ready(function (e) {

    var $modal = $('#popup-home').modal({show: false});

    // Links not leaving page
    $("#popup-home #popup-body a:not([href^='http'])").click(function () {
        $modal.modal('hide');
    });

    // External links
    $("#popup-home #popup-body a[href^='http']").click(rememberMe);
    // Popup close
    $modal.on('hidden', rememberMe);

    enhanceTrekPreviews();

    if (showModal() && MOBILE === false) {
        $modal.modal('show');
    }

    $(window).on('view:home view:detail', function () {
        // Popup is shown only on homepage
        $('header a.home.popup, header li.home a').click(function (e) {
            if (/^\/[a-zA-Z_]{2,5}\/$/.test(window.location.pathname)) {
                $modal.modal('show');
                e.preventDefault();
            }
        });
    });

});

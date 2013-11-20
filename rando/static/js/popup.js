$(document).ready(function (e) {

    if (showModal() && MOBILE === false) {
        $('#popup-home').modal()
                        .on('hidden', onPopupClose);
    }

    function showModal() {
        return localStorage.getItem('popup-shown') !== "yes";
    }

    function onPopupClose() {
        localStorage.setItem('popup-shown', "yes");
    }
});

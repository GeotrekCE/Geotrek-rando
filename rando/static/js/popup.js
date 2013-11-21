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

    enhanceTrekPreviews();

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

    function enhanceTrekPreviews () {
        $('#popup-home [data-trek]').each(function () {
            var $this = $(this);
            var trekId = $this.data('trek');

            if (/random/.test(trekId)) {
                trekId = randomTrek();
            }

            var trek = getTrek(trekId);
            if (!trek) return;

            $this.removeAttr('data-trek');
            $this.find('img.preview').attr('src', trek.properties.pictures[0].url)
                                     .attr('alt', trek.properties.pictures[0].legend);
            $this.find('a.profile').attr('href', '/' + trek.properties.slug)
                                   .addClass('pjax');
        });

        function randomTrek() {
            var i = Math.floor(Math.random() * window.treks.features.length),
                trek = window.treks.features[i];
            return trek.id;
        }

        function getTrek(trekid) {
            for (var i=0, n=window.treks.features.length; i<n; i++) {
                var trek = window.treks.features[i];
                if (trek.id === trekid || trek.properties.slug == trekid)
                    return trek;
            }
            return null;
        }
    }
});

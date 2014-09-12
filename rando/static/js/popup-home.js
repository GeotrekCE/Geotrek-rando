$(document).ready(function (e) {

    var $modal = $('#popup-home').modal({show: false});

    // Always show on landing ?
    var FORCED = $modal.hasClass('forced');

    // Links not leaving page
    $("#popup-home #popup-body a:not([href^='http'])").click(function () {
        $modal.modal('hide');
    });

    // External links
    $("#popup-home #popup-body a[href^='http']").click(rememberMe);
    // Popup close
    $modal.on('hidden', rememberMe);

    enhanceTrekPreviews();

    if ((FORCED || showModal()) && Rando.MOBILE === false) {
        $modal.modal('show');
    }

    function showModal() {
        var alreadyShown = localStorage.getItem('popup-shown') === "yes",
            landingHome = /^\/[a-zA-Z_]{2,5}\/$/.test(window.location.pathname),
            noFilter = (window.location.hash === "");
        return !alreadyShown && landingHome && noFilter;
    }

    function rememberMe() {
        localStorage.setItem('popup-shown', "yes");
    }

    function enhanceTrekPreviews () {
        /*
         * Within the popup, there is a way to show an existing trek,
         * using the ``data-trek`` attribute.
         * It can take :
         *  - a trek id
         *  - a trek slug
         *  - 'random'
         * Its preview will be shown, and it will link to the detail page.
         */
        var treksList = [];
        $('#results .result').each(function () {
            var $trek = $(this);
            treksList.push({
                preview: $trek.data('main-image'),
                slug: $trek.data('slug'),
                name: $trek.data('name'),
                id: $trek.data('id')
            });
        });

        $('#popup-home [data-trek]').each(function () {
            var $this = $(this);
            var trekId = $this.data('trek');

            if (/random/.test(trekId)) {
                trekId = randomTrek();
            }

            var trek = jQuery.grep(treksList, function(t) {
                return t.id === trekId || t.slug == trekId;
            })[0];

            if (trek) {
                $this.removeAttr('data-trek');
                $this.find('img:first').attr('src', trek.preview)
                                       .attr('alt', trek.name);
                $this.find('a.profile').attr('href', '/' + trek.slug);
            }
        });

        function randomTrek() {
            var i = Math.floor(Math.random() * treksList.length),
                trek = treksList[i];
            return trek ? trek.id : null;
        }
    }
});

$(window).on('view:home view:detail', function (e) {
    // Popup is shown only on homepage
    $('header a.home.popup, header li.home a').click(function (e) {
        var home_url = /^\/[a-zA-Z_]{2,5}\/$/;
        if (home_url.test(window.location.pathname)) {
            $('#popup-home').modal('show');
            e.preventDefault();
            return false;
        }
    });
});

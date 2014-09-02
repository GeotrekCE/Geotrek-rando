$(window).on('view:ui', function () {
    window.backPack = new BackPack();
});

$(window).on('view:home view:detail', initBackpack);

function initBackpack() {
    $(window).on("backpack:change", refresh_backpack);

    // Refresh tab results
    refresh_backpack();

    var $detailBackpack = $(".detail-content .btn.backpack"),
        trekId = $detailBackpack.data('id');
    if (window.backPack.contains(trekId))
        $detailBackpack.addClass('active');
    else
        $detailBackpack.removeClass('active');

    // Add trek to backpack
    $('.btn.backpack').on('click', function (e) {
        var trekid = $(this).data('id'),
            trekname = $(this).data('name');
        if (window.backPack.contains(trekid)) {
            window.backPack.remove(trekid);
            $(this).removeClass('active');
            // Track event
            _gaq.push(['_trackEvent', 'Backpack', 'Remove', trekname]);
        }
        else {
            window.backPack.save(trekid);
            $(this).addClass('active');
            _gaq.push(['_trackEvent', 'Backpack', 'Add', trekname]);
        }
    });


    // Show backpack tab
    $('#tab-backpack a').off('click').on('click', function (e) {
        e.preventDefault();

        if ($(this).parent().hasClass('active')) {
            $(document).off('click.backpack');
        } else {
            $(document).on('click.backpack', function (e) {
                if ($('#tab-backpack').has(e.target).length === 0 && e.target != $('#tab-backpack')[0]){
                    $('#backpack').hide();
                    $('#tab-backpack').removeClass('active');
                    $(document).off('click.backpack');
                }
            });
        }

        $(this).parent().toggleClass('active');
        $('#backpack').toggle();
    });

}


function refresh_backpack() {
    $('#backpack .result').each(function () {
        var $trek = $(this),
            trekId = $trek.data('id');
        if (window.backPack.contains(trekId)) {
            $trek.show(200);
        }
        else {
            $trek.hide(200);
        }
    });

    $('#results .result, #backpack .result').each(function () {
        var $trek = $(this),
            trekId = $trek.data('id');
        if (window.backPack.contains(trekId)) {
            $trek.find('.btn.backpack').addClass('active')
                                       .attr('title', gettext('Remove from favorites'))
                                       .removeClass('icon-backpack-add')
                                       .addClass('icon-backpack-remove');
        }
        else {
            $trek.find('.btn.backpack').removeClass('active')
                                       .attr('title', gettext('Add to favorites'))
                                       .removeClass('icon-backpack-remove')
                                       .addClass('icon-backpack-add');
        }
    });

    if (window.backPack.length() > 0)
        $('#backpackempty').hide(200);
    else
        $('#backpackempty').show(200);

    // Refresh label with number of items
    $('#tab-backpack span.badge').html(window.backPack.length());
}
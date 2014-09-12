$(window).on('view:mobile', function () {
    var $menuButton = $('#toggle-header-mobile'),
        $menu       = $('header');

    // Pages menu toggle
    $menuButton.on('click', function (e) {
        // if menu open
        if($menu.hasClass('open')) {
            $menu.removeClass('open');
            $(this).removeClass('active');
            $(document).off('click.menu');
        } else {
            $menu.addClass('open');
            $(this).addClass('active');

            // any touch outside, close the menu
            $(document).on('click.menu', function (e) {
                if ($menu.has(e.target).length === 0 && e.target != $menu[0] && $menuButton.has(e.target).length === 0 && e.target != $menuButton[0]){
                    $menu.removeClass('open');
                    $menuButton.removeClass('active');
                    $(document).off('click.menu');
                }
            });
        }
    });

    $('#navigationbar a.pjax').on('click', function (e) {
        $menu.removeClass('open');
        $menuButton.removeClass('active');
    });
});

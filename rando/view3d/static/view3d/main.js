$(window).on("view:detail", function(e) {
    console.log("View 3d Button");
    // View 3d
    $("a.view3d").click(function () {
        var slug = window.trek.properties.slug,
            url = window.view3d_url.replace('empty', slug);
        $('<iframe />', {
            name: 'frame1',
            id: 'frame1',
            frameBorder: 0,
            src: url
        }).appendTo('#popup-view3d .modal-body');
        $("#popup-view3d").modal('show');
        $('#popup-view3d').on('hidden', function () {
            $(this).find('iframe').remove();
        });
    });
});
$(window).on("view:detail", function(e) {

    var view3d_url = $("#popup-view3d").data('url');

    $("a.view3d").click(function () {
        var slug = $(this).data('slug'),
            url = view3d_url.replace('empty', slug);
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

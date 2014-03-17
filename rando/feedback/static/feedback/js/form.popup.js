
$(window).on('map:init', function(e) {

    var detail = e.originalEvent ?
                 e.originalEvent.detail : e.detail;
    var map = detail.map;

    var layerGroup = L.layerGroup().addTo(map);

    map.on('click', function(e) {

        // Cleaning layer group to display only one marker
        layerGroup.clearLayers();

        var lat = e.latlng.lat;
        var lng = e.latlng.lng;

        new_marker = L.marker([lat, lng], {
            draggable: true}).addTo(layerGroup);

        // Updating form lat/long fields according to marker position
        $('#feedback-form [name="latitude"]').val(lat);
        $('#feedback-form [name="longitude"]').val(lng);
    });
});


$(window).on("view:detail", function (e) {

    var feedbackUrl = $("#popup-feedback").data('url');

    $('a.feedback').on('click', function(event) {

        event.preventDefault();

        $('#popup-feedback').on('hidden', function () {
            $(this).find('form').remove();
        });

        $.get(feedbackUrl, function(data) {
            $('#popup-feedback .modal-body').append(data);
            var $popup = $("#popup-feedback");
            $popup.on('shown', function () {
                loadmapfeedbackmap();
            });
            $popup.modal('show');
        });
    });

    $('#popup-feedback').on('click', 'button[type="submit"]', function(event) {

        event.preventDefault();

        // Getting each form standard input/select/... values
        var postValues = $('#feedback-form').serialize();

        $.post(feedbackUrl, postValues, function(data) {
            if (data['status'] == 'NOK') {
                // If form is not valid, we display form with according errors
                $('#popup-feedback .modal-body form').replaceWith(data['data']);
            }
            else {
                // Form is valid, we close the popup
                // FIXME: find a way to tell user that email has been correctly sent ?
                $("#popup-feedback").modal('hide');
            }
        });
    });

});

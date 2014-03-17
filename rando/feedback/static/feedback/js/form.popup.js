

function initializeMarkerIfLatLon(layerGroup) {

    var lat = $('#feedback-form [name="latitude"]').val();
    var lng = $('#feedback-form [name="longitude"]').val();

    if (lat && lng) {
        new_marker = L.marker([lat, lng]).addTo(layerGroup);
    }
}

function listenLatLngFields(layerGroup) {

    $('#feedback-form [name="latitude"], #feedback-form [name="longitude"]').on('focusout', function() {
        layerGroup.clearLayers();
        initializeMarkerIfLatLon(layerGroup);
    });

}

function feedbackmapInit(map, bounds) {

    var layerGroup = L.layerGroup().addTo(map);

    // If lat/lng form inputs have values, initializing map with according markup
    initializeMarkerIfLatLon(layerGroup);

    // Updating marker position (on 'focusout' event) if user edits input fields
    listenLatLngFields(layerGroup);

    map.on('click', function(e) {

        // Cleaning layer group to display only one marker
        layerGroup.clearLayers();

        var lat = e.latlng.lat;
        var lng = e.latlng.lng;

        new_marker = L.marker([lat, lng]).addTo(layerGroup);
        new_marker.on('click', function() {
            layerGroup.removeLayer(this);
            $('#feedback-form [name="latitude"]').val('');
            $('#feedback-form [name="longitude"]').val('');
        });

        // Updating form lat/long fields according to marker position
        $('#feedback-form [name="latitude"]').val(lat);
        $('#feedback-form [name="longitude"]').val(lng);
    });

    detailmapInit(map, bounds);
}

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
                // Loading manually feedback map when popup is visible
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

                // Reloading manually feedback map, needed by newly replaced markup
                loadmapfeedbackmap();
            }
            else {
                // Form is valid, we close the popup
                // FIXME: find a way to tell user that email has been correctly sent ?
                $("#popup-feedback").modal('hide');
            }
        });
    });

});

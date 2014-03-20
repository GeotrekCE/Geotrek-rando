
function initializeMarkerIfLatLon(layerGroup) {

    var lat = $('#feedback-form [name="latitude"]').val();
    var lng = $('#feedback-form [name="longitude"]').val();

    if (lat && lng) {
        new_marker = L.marker([lat, lng]).addTo(layerGroup);
    }
}

function listenLatLngFields(layerGroup) {

    $('#feedback-form [name="latitude"], #feedback-form [name="longitude"]').on('change', function() {
        layerGroup.clearLayers();
        initializeMarkerIfLatLon(layerGroup);
    });

}

function feedbackmapMarkerInit(map, bounds) {

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

        $('.helpclic').hide();
    });
}


function feedbackmapInit(map, bounds) {
    // Hide Leaflet prefix
    map.attributionControl.setPrefix('');

    // Minimize minimap by default
    map.on('viewreset', function () {
        map.minimapcontrol._minimize();
    });

    var trekGeoJson = JSON.parse(document.getElementById('trek-geojson').innerHTML);
    var trekLayer = initDetailTrekMap(map, trekGeoJson);
    var wholeBounds = trekLayer.getBounds();
    map.fitBounds(wholeBounds);

    map.whenReady(function () {

        if (map.layerscontrol) map.removeControl(map.layerscontrol);

        new L.Control.ResetView(getWholeBounds, {position: 'topright'}).addTo(map);
        map.addControl(new L.Control.Scale({imperial: false, position: 'bottomright'}));

        $(map._container).css('cursor','pointer');

        // Doing some init on marker management
        feedbackmapMarkerInit(map, bounds);

        $(window).trigger('map:ready', [map, 'detail']);

        // Adding class on map DOM when ready
        // Useful for integration tests (CasperJS or others...)
        $('#feedbackmap').addClass('ready');

    });

    function getWholeBounds() {
        return wholeBounds;
    }
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
            var status = data['status'];

            switch(status) {

                case 'FORM_INVALID':
                    // If form is not valid, we display form with according errors
                    $('#popup-feedback .modal-body form').replaceWith(data['data']);
                    // Reloading manually feedback map, needed by newly replaced markup
                    loadmapfeedbackmap();
                    break;

                case 'EMAIL_SENDING_OK':
                    // Form is valid, email is sent, we close the popup and display "OK" popup
                    $("#popup-feedback").modal('hide');
                    $("#popup-feedback-ok").modal('show');
                    break;

                case 'EMAIL_SENDING_FAILED':
                    // Form is valid, but email has not been sent (due to server error),
                    // we close the popup and display "NOK" popup
                    $("#popup-feedback").modal('hide');
                    $("#popup-feedback-nok").modal('show');
                    break;

                default:
                    // Else, we just close the popup
                    $("#popup-feedback").modal('hide');
            }
        }).fail(function() {
            $("#popup-feedback").modal('hide');
            $("#popup-feedback-nok").modal('show');
        });
    });

});

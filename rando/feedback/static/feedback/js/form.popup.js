
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

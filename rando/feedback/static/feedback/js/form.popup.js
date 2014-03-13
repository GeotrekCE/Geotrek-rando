
$(window).on("view:detail", function (e) {

    var feedbackUrl = $("#popup-feedback").data('url');

    $('a.feedback').on('click', function(event) {

        event.preventDefault();

        var slug = $(this).data('slug'),
            url = feedbackUrl.replace('empty', slug);

        $('#popup-feedback').on('hidden', function () {
            $(this).find('form').remove();
        });

        $.get(url, function(data) {
            $('#popup-feedback .modal-body').append(data);
            $("#popup-feedback").modal('show');
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

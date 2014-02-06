$(document).ready(function (e) {

    $('.feedback').on('click', function(event) {

        event.preventDefault();

        var feedbackUrl = $("#popup-feedback").data('url');

        $('#popup-feedback').on('hidden', function () {
            $(this).find('form').remove();
        });

        $.get(feedbackUrl, function(data) {
            $('#popup-feedback .modal-body').append(data);    
            $("#popup-feedback").modal('show');
        });
    });

});
